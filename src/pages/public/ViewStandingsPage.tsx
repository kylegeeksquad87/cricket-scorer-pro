
import React, { useState, useEffect } from 'react';
import { League, Team } from '../../types'; // Assuming Score/Points are part of Team or a separate Standings type
import { useData } from '../../contexts/DataContext';
import Card from '../../components/common/Card';
import { ICONS } from '../../constants';

interface TeamStanding extends Team {
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate?: number; // Optional, complex to calculate
}

const ViewStandingsPage: React.FC = () => {
  const { leagues, teams: allTeams, matches, fetchLeagues, fetchTeams, fetchMatches, loadingData } = useData();
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [standings, setStandings] = useState<TeamStanding[]>([]);

  useEffect(() => {
    fetchLeagues();
    fetchTeams(); // Fetch all teams
    fetchMatches(); // Fetch all matches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leagues.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(leagues[0].id);
    }
  }, [leagues, selectedLeagueId]);

  useEffect(() => {
    if (selectedLeagueId && allTeams.length > 0 && matches.length > 0) {
      const leagueTeams = allTeams.filter(t => t.leagueId === selectedLeagueId);
      const leagueMatches = matches.filter(m => m.leagueId === selectedLeagueId && m.status === 'Completed'); // Only completed matches

      const newStandings: TeamStanding[] = leagueTeams.map(team => {
        let played = 0, won = 0, lost = 0, tied = 0, noResult = 0, points = 0;
        // Simplified points calculation: Win = 2, Tie/NR = 1
        leagueMatches.forEach(match => {
          if (match.teamAId === team.id || match.teamBId === team.id) {
            played++;
            if (match.result) { // Example: "Team X won by Y runs" or "Match Tied" or "No Result"
              if (match.result.startsWith(team.name)) { // Team won
                won++;
                points += 2;
              } else if (match.result.includes("Tied") || match.result.includes("No Result")) {
                if(match.result.includes("Tied")) tied++; else noResult++;
                points += 1;
              } else { // Team lost (assuming other team won)
                lost++;
              }
            } else { // No result explicitly stated, might be complex
                noResult++;
                points +=1;
            }
          }
        });
        return { ...team, played, won, lost, tied, noResult, points };
      });
      
      newStandings.sort((a, b) => b.points - a.points || ( (b.netRunRate || 0) - (a.netRunRate || 0) ) ); // Sort by points, then NRR
      setStandings(newStandings);
    } else {
      setStandings([]);
    }
  }, [selectedLeagueId, allTeams, matches, leagues]);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">League Standings</h1>
      
      <div className="mb-4">
        <label htmlFor="leagueSelect" className="block text-sm font-medium text-gray-700">Select League:</label>
        <select
          id="leagueSelect"
          className="mt-1 block w-full md:w-1/2 lg:w-1/3 p-2 border border-gray-300 rounded-md bg-white"
          value={selectedLeagueId}
          onChange={(e) => setSelectedLeagueId(e.target.value)}
          disabled={leagues.length === 0 || loadingData}
        >
          {leagues.length === 0 && <option>Loading leagues...</option>}
          {leagues.map(league => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
      </div>

      {loadingData && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading standings...</p>}
      
      {!loadingData && selectedLeagueId && standings.length === 0 && (
        <Card><p className="text-gray-600 text-center py-4">No standings available for this league, or no matches completed.</p></Card>
      )}

      {!loadingData && selectedLeagueId && standings.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pld</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Won</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NRR</th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.played}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.won}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.lost}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.tied}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.noResult}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{team.points}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.netRunRate?.toFixed(3) || 'N/A'}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default ViewStandingsPage;
