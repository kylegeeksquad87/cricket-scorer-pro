
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Match, Team, League, MatchStatus } from '../types';
import { NAV_LINKS, ICONS } from '../constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

const HomePage: React.FC = () => {
  const { matches, teams, leagues, fetchMatches, fetchTeams, fetchLeagues, loadingData } = useData();

  useEffect(() => {
    // Data might already be fetched by DataContext, but can re-fetch if needed
    if (!matches.length) fetchMatches();
    if (!teams.length) fetchTeams();
    if (!leagues.length) fetchLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upcomingMatches = matches
    .filter(match => match.status === MatchStatus.SCHEDULED || match.status === MatchStatus.LIVE)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  const getTeamName = (teamId: string): string => teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  const getLeagueName = (leagueId: string): string => leagues.find(l => l.id === leagueId)?.name || 'Unknown League';

  return (
    <div className="space-y-8">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Welcome to Cricket Scorer Pro!</h1>
        <p className="text-lg opacity-90">Your one-stop solution for managing cricket leagues, teams, and live scoring.</p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upcoming Matches</h2>
        {loadingData && !upcomingMatches.length && <p className="text-gray-600 flex items-center">{ICONS.SPINNER} Loading matches...</p>}
        {!loadingData && upcomingMatches.length === 0 && <p className="text-gray-600">No upcoming matches scheduled.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingMatches.map((match: Match) => (
            <Card key={match.id} className="hover:shadow-2xl transition-shadow duration-300">
              <div className="p-1">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${match.status === MatchStatus.LIVE ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
                  {match.status}
                </span>
                <p className="text-sm text-gray-500 mt-1">{getLeagueName(match.leagueId)}</p>
                <h3 className="text-xl font-semibold my-2 text-gray-800">
                  {getTeamName(match.teamAId)} vs {getTeamName(match.teamBId)}
                </h3>
                <p className="text-sm text-gray-600"><i className="fas fa-calendar-alt mr-2"></i>{new Date(match.dateTime).toLocaleString()}</p>
                <p className="text-sm text-gray-600"><i className="fas fa-map-marker-alt mr-2"></i>{match.venue}</p>
                <p className="text-sm text-gray-600">Overs: {match.overs}</p>
                 <div className="mt-4 flex space-x-2">
                    <Link to={NAV_LINKS.VIEW_SCORECARD_DYNAMIC(match.id)}>
                        <Button variant="secondary" size="sm" leftIcon={ICONS.VIEW}>View Scorecard</Button>
                    </Link>
                    { (match.status === MatchStatus.SCHEDULED || match.status === MatchStatus.LIVE) && 
                        <Link to={NAV_LINKS.SCORE_MATCH_DYNAMIC(match.id)}>
                            <Button variant="primary" size="sm" leftIcon={ICONS.SCORING}>Score Match</Button>
                        </Link>
                    }
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link to={NAV_LINKS.ADMIN_LEAGUES}>
            <Card className="hover:bg-blue-50 transition-colors duration-200">
              <div className="flex items-center">
                <span className="text-blue-500 text-2xl mr-3">{ICONS.LEAGUES}</span>
                <h3 className="text-lg font-medium text-gray-700">Manage Leagues</h3>
              </div>
            </Card>
          </Link>
          <Link to={NAV_LINKS.STANDINGS}>
            <Card className="hover:bg-green-50 transition-colors duration-200">
              <div className="flex items-center">
                <span className="text-green-500 text-2xl mr-3">{ICONS.STATS}</span>
                <h3 className="text-lg font-medium text-gray-700">View Standings</h3>
              </div>
            </Card>
          </Link>
           <Link to={NAV_LINKS.SCORING_HOME}>
            <Card className="hover:bg-yellow-50 transition-colors duration-200">
              <div className="flex items-center">
                <span className="text-yellow-500 text-2xl mr-3">{ICONS.SCORING}</span>
                <h3 className="text-lg font-medium text-gray-700">Start Scoring</h3>
              </div>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
