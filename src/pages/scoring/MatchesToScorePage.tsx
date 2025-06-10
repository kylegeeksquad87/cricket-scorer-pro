
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Match, MatchStatus, UserRole } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { NAV_LINKS, ICONS } from '../../constants';

const MatchesToScorePage: React.FC = () => {
  const { matches, teams, fetchMatches, fetchTeams, loadingData } = useData();
  const { user } = useAuth();
  const [availableMatches, setAvailableMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && matches.length > 0) {
      const now = new Date().getTime();
      const filtered = matches.filter(match => {
        const matchTime = new Date(match.dateTime).getTime();
        const canScore = (user.role === UserRole.ADMIN || user.role === UserRole.SCORER); // Add specific scorer assignments later
        
        // Scoring opens 60 mins before and closes 120 mins after for non-admin
        const scoringWindowOpen = matchTime - (60 * 60 * 1000);
        const scoringWindowClose = matchTime + (120 * 60 * 1000);

        const isWithinWindow = (now >= scoringWindowOpen && now <= scoringWindowClose);
        
        return canScore && 
               (match.status === MatchStatus.SCHEDULED && (user.role === UserRole.ADMIN || isWithinWindow)) ||
               (match.status === MatchStatus.LIVE);
      });
      setAvailableMatches(filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, matches]);

  const getTeamName = (teamId: string): string => teams.find(t => t.id === teamId)?.name || 'Unknown Team';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Matches Available for Scoring</h1>

      {loadingData && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading matches...</p>}
      
      {!loadingData && availableMatches.length === 0 && (
        <Card>
          <p className="text-gray-600 text-center py-4">No matches currently available for you to score. Check back later or ensure matches are scheduled and within the scoring window.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availableMatches.map((match) => (
          <Card key={match.id} title={`${getTeamName(match.teamAId)} vs ${getTeamName(match.teamBId)}`}>
            <p className="text-sm text-gray-600"><strong>Date:</strong> {new Date(match.dateTime).toLocaleString()}</p>
            <p className="text-sm text-gray-600"><strong>Venue:</strong> {match.venue}</p>
            <p className="text-sm text-gray-600"><strong>Status:</strong> 
              <span className={`ml-2 font-semibold ${match.status === MatchStatus.LIVE ? 'text-red-500' : 'text-blue-500'}`}>
                {match.status}
              </span>
            </p>
            <div className="mt-4">
              <Link to={NAV_LINKS.SCORE_MATCH_DYNAMIC(match.id)}>
                <Button variant="primary" leftIcon={ICONS.SCORING}>
                  {match.status === MatchStatus.LIVE ? 'Continue Scoring' : 'Start Scoring'}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MatchesToScorePage;
