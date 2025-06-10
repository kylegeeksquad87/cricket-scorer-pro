
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { League, Team, Player, Match, PlayerFormData, MatchFormData, TeamFormData, LeagueFormData, Scorecard, MatchStatus } from '../types';
import { BASE_API_URL } from '../constants'; // Import BASE_API_URL

// Log the BASE_API_URL when DataContext module is loaded
console.log('DataContext loaded, BASE_API_URL:', BASE_API_URL);

interface DataContextType {
  leagues: League[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  
  fetchLeagues: () => Promise<void>;
  addLeague: (leagueData: LeagueFormData) => Promise<League | void>;
  updateLeague: (id: string, leagueData: Partial<LeagueFormData>) => Promise<League | void>;
  deleteLeague: (id: string) => Promise<void>;

  fetchTeams: (leagueId?: string) => Promise<void>;
  addTeam: (teamData: TeamFormData & { leagueId: string }) => Promise<Team | void>;
  updateTeam: (id: string, teamData: Partial<TeamFormData> & { leagueId: string }) => Promise<Team | void>;
  deleteTeam: (id: string) => Promise<void>;

  fetchPlayers: (teamId?: string) => Promise<void>;
  addPlayer: (playerData: PlayerFormData) => Promise<Player | void>;
  updatePlayer: (id: string, playerData: PlayerFormData) => Promise<Player | void>;
  deletePlayer: (id: string) => Promise<void>;

  fetchMatches: (leagueId?: string) => Promise<void>;
  fetchMatchById: (matchId: string) => Promise<Match | null>;
  addMatch: (matchData: MatchFormData) => Promise<Match | void>;
  updateMatch: (id: string, matchData: Partial<Match>) => Promise<Match | void>; // Changed MatchFormData to Match
  deleteMatch: (id: string) => Promise<void>;
  
  fetchScorecardByMatchId: (matchId: string) => Promise<Scorecard | null>;
  updateScorecard: (scorecard: Scorecard) => Promise<Scorecard | void>;

  findLeagueById: (id: string) => League | undefined;
  findTeamById: (id: string) => Team | undefined;
  findPlayerById: (id: string) => Player | undefined;
  
  loadingLeagues: boolean;
  loadingTeams: boolean;
  loadingPlayers: boolean;
  loadingMatches: boolean;
  loadingScorecards: boolean;
  loadingData: boolean;
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

  const clearError = useCallback(() => setError(null), []);

  const handleApiCall = useCallback(async <TResponse, TPayload = undefined>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    payload?: TPayload,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  ): Promise<TResponse> => {
    if (setLoading) setLoading(true);
    setError(null); // Clear previous errors before a new call
    console.log(`DataContext: API call ${method} to ${BASE_API_URL}${endpoint}`); 
    try {
      const config: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json', },
      };
      if (payload && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(payload);
      }
      const response = await fetch(`${BASE_API_URL}${endpoint}`, config);
      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } catch(e) { errorData = { message: `HTTP error! status: ${response.status} - ${response.statusText}` }; }
        throw new Error(errorData?.error || errorData?.message || `API Error: ${response.status}`);
      }
      if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as TResponse; 
      return await response.json() as TResponse;
    } catch (err: any) {
      console.error(`API call failed for ${method} ${BASE_API_URL}${endpoint}:`, err);
      setError(err.message || 'An unexpected error occurred.');
      throw err;
    } finally {
      if (setLoading) setLoading(false);
    }
  }, [setError]); // setError is stable
  
  // Leagues
  const fetchLeagues = useCallback(async () => {
    const data = await handleApiCall<League[]>('/leagues', 'GET', undefined, setLoadingLeagues);
    if (data) setLeagues(data);
  }, [handleApiCall, setLeagues]);
  const addLeague = useCallback(async (leagueData: LeagueFormData) => {
    const newLeague = await handleApiCall<League, LeagueFormData>('/leagues', 'POST', leagueData, setLoadingLeagues);
    if (newLeague) setLeagues(prev => [newLeague, ...prev.filter(l => l.id !== newLeague.id)]);
    return newLeague;
  }, [handleApiCall, setLeagues]);
  const updateLeague = useCallback(async (id: string, leagueData: Partial<LeagueFormData>) => {
    const updatedLeague = await handleApiCall<League, Partial<LeagueFormData>>(`/leagues/${id}`, 'PUT', leagueData, setLoadingLeagues);
    if (updatedLeague) setLeagues(prev => prev.map(l => l.id === id ? updatedLeague : l));
    return updatedLeague;
  }, [handleApiCall, setLeagues]);
  const deleteLeague = useCallback(async (id: string) => {
    await handleApiCall<void>(`/leagues/${id}`, 'DELETE', undefined, setLoadingLeagues);
    setLeagues(prev => prev.filter(l => l.id !== id));
    setTeams(prev => prev.filter(t => t.leagueId !== id));
    setMatches(prev => prev.filter(m => m.leagueId !== id));
  }, [handleApiCall, setLeagues, setTeams, setMatches]);

  // Teams
  const fetchTeams = useCallback(async (leagueId?: string) => {
    const endpoint = leagueId ? `/teams?leagueId=${leagueId}` : '/teams';
    const data = await handleApiCall<Team[]>(endpoint, 'GET', undefined, setLoadingTeams);
     if (data) {
        if (leagueId) {
            setTeams(prev => [...prev.filter(t => t.leagueId !== leagueId), ...data]);
        } else {
            setTeams(data);
        }
    }
  }, [handleApiCall, setTeams]);
  const addTeam = useCallback(async (teamData: TeamFormData & { leagueId: string }) => {
    const newTeam = await handleApiCall<Team, TeamFormData & { leagueId: string }>('/teams', 'POST', teamData, setLoadingTeams);
    if (newTeam) {
        setTeams(prev => [newTeam, ...prev.filter(t => t.id !== newTeam.id)]);
        setLeagues(prevLeagues => prevLeagues.map(l => 
            l.id === newTeam.leagueId 
            ? { ...l, teams: [...(l.teams || []).filter(lt => lt.id !== newTeam.id), {id:newTeam.id, name: newTeam.name, leagueId: newTeam.leagueId } as Team] } 
            : l
        ));
    }
    return newTeam;
  }, [handleApiCall, setTeams, setLeagues]);
  const updateTeam = useCallback(async (id: string, teamData: Partial<TeamFormData> & { leagueId: string }) => {
    const updatedTeam = await handleApiCall<Team, Partial<TeamFormData>>(`/teams/${id}`, 'PUT', teamData, setLoadingTeams);
    if (updatedTeam) {
        setTeams(prev => prev.map(t => t.id === id ? {...t, ...updatedTeam} : t));
        setLeagues(prevLeagues => prevLeagues.map(l => {
            if (l.id === updatedTeam.leagueId) {
                const teamExistsInLeague = (l.teams || []).find(lt => lt.id === id);
                if (teamExistsInLeague) {
                    return {...l, teams: (l.teams || []).map(lt => lt.id === id ? {...lt, name: updatedTeam.name, captainId: updatedTeam.captainId, logoUrl: updatedTeam.logoUrl } as Team : lt) };
                } else { 
                     return {...l, teams: [...(l.teams || []), {...updatedTeam} as Team] };
                }
            } else if (l.teams?.find(lt => lt.id === id)) { 
                 return {...l, teams: (l.teams || []).filter(lt => lt.id !== id) };
            }
            return l;
        }));
    }
    return updatedTeam;
  }, [handleApiCall, setTeams, setLeagues]);
  const deleteTeam = useCallback(async (id: string) => {
    await handleApiCall<void>(`/teams/${id}`, 'DELETE', undefined, setLoadingTeams);
    const deletedTeam = teams.find(t => t.id === id); // Find before filtering
    setTeams(prev => prev.filter(t => t.id !== id));
    if (deletedTeam) {
        setLeagues(prevLeagues => prevLeagues.map(l => 
            l.id === deletedTeam.leagueId 
            ? { ...l, teams: (l.teams || []).filter(lt => lt.id !== id) } 
            : l
        ));
    }
    setMatches(prev => prev.filter(m => m.teamAId !== id && m.teamBId !== id));
  }, [handleApiCall, teams, setTeams, setLeagues, setMatches]);
  
  // Players
  const fetchPlayers = useCallback(async (teamId?: string) => {
    const endpoint = teamId ? `/players?teamId=${teamId}` : '/players';
    const data = await handleApiCall<Player[]>(endpoint, 'GET', undefined, setLoadingPlayers);
    if (data) {
        if(teamId){ 
            setPlayers(prevPlayers => {
                const otherPlayers = prevPlayers.filter(p => !data.some(dp => dp.id === p.id) && !p.teamIds.includes(teamId));
                return [...otherPlayers, ...data];
            });
        } else {
            setPlayers(data); 
        }
    }
  }, [handleApiCall, setPlayers]); 

  const addPlayer = useCallback(async (playerData: PlayerFormData) => {
    const apiPayload = { 
        firstName: playerData.firstName, 
        lastName: playerData.lastName, 
        email: playerData.email, 
        profilePictureUrl: playerData.profilePictureUrl, 
        teamId: playerData.initialTeamId 
    };
    const newPlayer = await handleApiCall<Player, typeof apiPayload>('/players', 'POST', apiPayload, setLoadingPlayers);
    if (newPlayer) setPlayers(prev => [newPlayer, ...prev.filter(p => p.id !== newPlayer.id)]);
    return newPlayer;
  }, [handleApiCall, setPlayers]);

  const updatePlayer = useCallback(async (id: string, playerData: PlayerFormData) => {
    const apiPayload = { 
        firstName: playerData.firstName, 
        lastName: playerData.lastName, 
        email: playerData.email, 
        profilePictureUrl: playerData.profilePictureUrl, 
        teamIds: playerData.teamIds 
    };
    const updatedPlayer = await handleApiCall<Player, typeof apiPayload>(`/players/${id}`, 'PUT', apiPayload, setLoadingPlayers);
    if (updatedPlayer) setPlayers(prev => prev.map(p => p.id === id ? updatedPlayer : p));
    return updatedPlayer;
  }, [handleApiCall, setPlayers]);

  const deletePlayer = useCallback(async (id: string) => {
    await handleApiCall<void>(`/players/${id}`, 'DELETE', undefined, setLoadingPlayers);
    setPlayers(prev => prev.filter(p => p.id !== id));
  }, [handleApiCall, setPlayers]);

  // Matches
  const fetchMatches = useCallback(async (leagueId?: string) => {
    const endpoint = leagueId ? `/matches?leagueId=${leagueId}` : '/matches';
    const data = await handleApiCall<Match[]>(endpoint, 'GET', undefined, setLoadingMatches);
    if (data) setMatches(data); 
  }, [handleApiCall, setMatches]);
  
  const fetchMatchById = useCallback(async (matchId: string): Promise<Match | null> => {
    try {
        const match = await handleApiCall<Match>(`/matches/${matchId}`, 'GET', undefined, setLoadingMatches);
        return match || null;
    } catch (err) { return null; }
  }, [handleApiCall, setLoadingMatches]);

  const addMatch = useCallback(async (matchData: MatchFormData) => {
    const newMatch = await handleApiCall<Match, MatchFormData>('/matches', 'POST', matchData, setLoadingMatches);
    if (newMatch) setMatches(prev => [newMatch, ...prev.filter(m => m.id !== newMatch.id)]);
    return newMatch;
  }, [handleApiCall, setMatches]);

  const updateMatch = useCallback(async (id: string, matchData: Partial<Match>) => { 
    const updatedMatch = await handleApiCall<Match, Partial<Match>>(`/matches/${id}`, 'PUT', matchData, setLoadingMatches);
    if (updatedMatch) setMatches(prev => prev.map(m => m.id === id ? updatedMatch : m));
    return updatedMatch;
  }, [handleApiCall, setMatches]);

  const deleteMatch = useCallback(async (id: string) => {
    await handleApiCall<void>(`/matches/${id}`, 'DELETE', undefined, setLoadingMatches);
    setMatches(prev => prev.filter(m => m.id !== id));
  }, [handleApiCall, setMatches]);
  
  // Scorecards
  const fetchScorecardByMatchId = useCallback(async (matchId: string): Promise<Scorecard | null> => {
    try {
      const scorecard = await handleApiCall<Scorecard | null>(`/scorecards/${matchId}`, 'GET', undefined, setLoadingScorecards);
      return scorecard;
    } catch (e) {
      if ((e as Error).message.includes("404") || (e as Error).message.includes("Not Found")) return null;
      throw e;
    }
  }, [handleApiCall, setLoadingScorecards]);

  const updateScorecard = useCallback(async (scorecardData: Scorecard) => {
    if (!scorecardData.id) scorecardData.id = `sc_${scorecardData.matchId}`;
    return await handleApiCall<Scorecard, Scorecard>(`/scorecards/${scorecardData.id}`, 'PUT', scorecardData, setLoadingScorecards);
  }, [handleApiCall, setLoadingScorecards]);

  // Client-side find functions
  const findLeagueById = useCallback((id: string) => leagues.find(l => l.id === id), [leagues]);
  const findTeamById = useCallback((id: string) => teams.find(t => t.id === id), [teams]);
  const findPlayerById = useCallback((id: string) => players.find(p => p.id === id), [players]);

  useEffect(() => {
    // Initial data fetch. These functions are now stable due to useCallback.
    fetchLeagues();
    fetchTeams(); 
    fetchPlayers();
    fetchMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep empty: only run on mount. fetch* functions are stable.
  
  const loadingData = loadingLeagues || loadingTeams || loadingPlayers || loadingMatches || loadingScorecards;

  return (
    <DataContext.Provider value={{ 
      leagues, teams, players, matches,
      fetchLeagues, addLeague, updateLeague, deleteLeague,
      fetchTeams, addTeam, updateTeam, deleteTeam,
      fetchPlayers, addPlayer, updatePlayer, deletePlayer,
      fetchMatches, fetchMatchById, addMatch, updateMatch, deleteMatch,
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
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
