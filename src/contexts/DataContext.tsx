
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { League, Team, Player, Match, PlayerFormData, MatchFormData, TeamFormData, LeagueFormData, Scorecard, Innings } from '../types';

// Define the base URL for your backend API
const BASE_API_URL = 'https://cricket-scorer-api-65205660267.us-east1.run.app/api'; // Adjust if your backend runs elsewhere

interface DataContextType {
  leagues: League[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  
  fetchLeagues: () => Promise<void>;
  addLeague: (leagueData: LeagueFormData) => Promise<League | void>;
  // updateLeague: (id: string, leagueData: Partial<LeagueFormData>) => Promise<League | void>;
  // deleteLeague: (id: string) => Promise<void>;

  fetchTeams: (leagueId?: string) => Promise<void>;
  addTeam: (teamData: TeamFormData & { leagueId: string }) => Promise<Team | void>;
  // updateTeam: (id: string, teamData: Partial<TeamFormData>) => Promise<Team | void>;
  // deleteTeam: (id: string) => Promise<void>;

  fetchPlayers: (teamId?: string) => Promise<void>;
  addPlayer: (playerData: PlayerFormData & { teamId?: string }) => Promise<Player | void>;
  // updatePlayer: (id: string, playerData: Partial<PlayerFormData>) => Promise<Player | void>;
  // deletePlayer: (id: string) => Promise<void>;

  fetchMatches: (leagueId?: string) => Promise<void>;
  fetchMatchById: (matchId: string) => Promise<Match | null>; // Now fetches from API
  addMatch: (matchData: MatchFormData) => Promise<Match | void>;
  updateMatch: (id: string, matchData: Partial<Match>) => Promise<Match | void>;
  // deleteMatch: (id: string) => Promise<void>;
  
  fetchScorecardByMatchId: (matchId: string) => Promise<Scorecard | null>;
  updateScorecard: (scorecard: Scorecard) => Promise<Scorecard | void>;

  findLeagueById: (id: string) => League | undefined; // client-side find
  findTeamById: (id: string) => Team | undefined; // client-side find
  findPlayerById: (id: string) => Player | undefined; // client-side find
  
  loadingLeagues: boolean;
  loadingTeams: boolean;
  loadingPlayers: boolean;
  loadingMatches: boolean;
  loadingScorecards: boolean;
  loadingData: boolean; // Aggregated loading state
  error: string | null;
  clearError: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [loadingLeagues, setLoadingLeagues] = useState<boolean>(false);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(false);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [loadingScorecards, setLoadingScorecards] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Generic API call handler
  const handleApiCall = async <TResponse, TPayload = undefined>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    payload?: TPayload,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  ): Promise<TResponse> => {
    if (setLoading) setLoading(true);
    setError(null);
    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      if (payload && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(payload);
      }

      const response = await fetch(`${BASE_API_URL}${endpoint}`, config);
      
      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch(e) {
            errorData = { message: `HTTP error! status: ${response.status} - ${response.statusText}` };
        }
        throw new Error(errorData?.error || errorData?.message || `API Error: ${response.status}`);
      }
      // For DELETE or methods that might not return content
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return undefined as TResponse; 
      }
      return await response.json() as TResponse;
    } catch (err: any) {
      console.error(`API call failed for ${method} ${endpoint}:`, err);
      setError(err.message || 'An unexpected error occurred.');
      throw err; // Re-throw for component-level handling if needed
    } finally {
      if (setLoading) setLoading(false);
    }
  };
  
  // Leagues
  const fetchLeagues = useCallback(async () => {
    const data = await handleApiCall<League[]>('/leagues', 'GET', undefined, setLoadingLeagues);
    if (data) setLeagues(data);
  }, []);
  const addLeague = async (leagueData: LeagueFormData) => {
    const newLeague = await handleApiCall<League, LeagueFormData>('/leagues', 'POST', leagueData, setLoadingLeagues);
    if (newLeague) setLeagues(prev => [newLeague, ...prev]); // Optimistic or re-fetch
    return newLeague;
  };

  // Teams
  const fetchTeams = useCallback(async (leagueId?: string) => {
    const endpoint = leagueId ? `/teams?leagueId=${leagueId}` : '/teams';
    const data = await handleApiCall<Team[]>(endpoint, 'GET', undefined, setLoadingTeams);
    if (data) setTeams(data);
  }, []);
  const addTeam = async (teamData: TeamFormData & { leagueId: string }) => {
    const newTeam = await handleApiCall<Team, TeamFormData & { leagueId: string }>('/teams', 'POST', teamData, setLoadingTeams);
    if (newTeam) {
        setTeams(prev => [newTeam, ...prev]);
        // Also update the teams array within the specific league object if leagues are already loaded
        setLeagues(prevLeagues => prevLeagues.map(l => 
            l.id === newTeam.leagueId 
            ? { ...l, teams: [...(l.teams || []), { id: newTeam.id, name: newTeam.name, leagueId: newTeam.leagueId, teamIds: [] /* satisfy Player type's teamIds (empty here as it's a team object) */ }] as Team[] } 
            : l
        ));
    }
    return newTeam;
  };
  
  // Players
  const fetchPlayers = useCallback(async (teamId?: string) => {
    const endpoint = teamId ? `/players?teamId=${teamId}` : '/players';
    const data = await handleApiCall<Player[]>(endpoint, 'GET', undefined, setLoadingPlayers);
    if (data) setPlayers(data);
  }, []);
  const addPlayer = async (playerData: PlayerFormData & { teamId?: string }) => {
    const newPlayer = await handleApiCall<Player, PlayerFormData & { teamId?: string }>('/players', 'POST', playerData, setLoadingPlayers);
    if (newPlayer) setPlayers(prev => [newPlayer, ...prev]);
    return newPlayer;
  };

  // Matches
  const fetchMatches = useCallback(async (leagueId?: string) => {
    const endpoint = leagueId ? `/matches?leagueId=${leagueId}` : '/matches';
    const data = await handleApiCall<Match[]>(endpoint, 'GET', undefined, setLoadingMatches);
    if (data) setMatches(data);
  }, []);
  
  const fetchMatchById = useCallback(async (matchId: string): Promise<Match | null> => {
    try {
        const match = await handleApiCall<Match>(`/matches/${matchId}`, 'GET', undefined, setLoadingMatches);
        return match || null;
    } catch (err) {
        // Error is set by handleApiCall, component can check context.error
        return null;
    }
  }, []);

  const addMatch = async (matchData: MatchFormData) => {
    const newMatch = await handleApiCall<Match, MatchFormData>('/matches', 'POST', matchData, setLoadingMatches);
    if (newMatch) setMatches(prev => [newMatch, ...prev]);
    return newMatch;
  };
  const updateMatch = async (id: string, matchData: Partial<Match>) => {
    const updatedMatch = await handleApiCall<Match, Partial<Match>>(`/matches/${id}`, 'PUT', matchData, setLoadingMatches);
    if (updatedMatch) {
      setMatches(prev => prev.map(m => m.id === id ? updatedMatch : m));
    }
    return updatedMatch;
  };
  
  // Scorecards
  const fetchScorecardByMatchId = async (matchId: string): Promise<Scorecard | null> => {
    try {
      const scorecard = await handleApiCall<Scorecard | null>(`/scorecards/${matchId}`, 'GET', undefined, setLoadingScorecards);
      return scorecard;
    } catch (e) {
      // Error is set by handleApiCall. If 404, it might mean no scorecard yet, which is fine.
      // Specific error handling for 404 might be needed if "null" is not desired for "not found"
      if ((e as Error).message.includes("404") || (e as Error).message.includes("Not Found")) {
        return null; // Explicitly return null for not found scorecards
      }
      throw e; // Re-throw other errors
    }
  };

  const updateScorecard = async (scorecardData: Scorecard) => {
    // Scorecard ID should be present, could be `sc_${matchId}` or similar
    if (!scorecardData.id) {
        scorecardData.id = `sc_${scorecardData.matchId}`; // Ensure ID for PUT
    }
    const updatedScorecard = await handleApiCall<Scorecard, Scorecard>(`/scorecards/${scorecardData.id}`, 'PUT', scorecardData, setLoadingScorecards);
    // No local state for all scorecards, components manage their own fetched scorecard.
    return updatedScorecard;
  };

  // Client-side find functions (operate on already fetched data)
  const findLeagueById = (id: string) => leagues.find(l => l.id === id);
  const findTeamById = (id: string) => teams.find(t => t.id === id);
  const findPlayerById = (id: string) => players.find(p => p.id === id);
  // findMatchById is now an API call

  useEffect(() => {
    // Initial data fetch (can be adjusted based on app needs, e.g., lazy loading)
    fetchLeagues();
    fetchTeams(); 
    fetchPlayers();
    fetchMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount
  
  const loadingData = loadingLeagues || loadingTeams || loadingPlayers || loadingMatches || loadingScorecards;

  return (
    <DataContext.Provider value={{ 
      leagues, teams, players, matches,
      fetchLeagues, addLeague,
      fetchTeams, addTeam,
      fetchPlayers, addPlayer,
      fetchMatches, fetchMatchById, addMatch, updateMatch,
      fetchScorecardByMatchId, updateScorecard,
      findLeagueById, findTeamById, findPlayerById,
      loadingLeagues, loadingTeams, loadingPlayers, loadingMatches, loadingScorecards, loadingData,
      error, clearError
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
