
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Match, Scorecard, Innings, Player, Team } from '../../types';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button'; // Added Button import
import { ICONS } from '../../constants';

const ViewScorecardPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { 
    fetchMatchById: fetchMatchFromApi, 
    fetchScorecardByMatchId, 
    findTeamById, // For team name lookup from context's already loaded teams
    players: allPlayersFromContext, // For player name lookup
    teams: allTeamsFromContext,
    loadingMatches: contextLoadingMatches,
    loadingScorecards: contextLoadingScorecards,
    error: contextError,
    clearError: clearContextError
  } = useData();

  const [match, setMatch] = useState<Match | null>(null);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!matchId) {
      setPageError("Match ID missing.");
      setPageLoading(false);
      return;
    }
    setPageLoading(true);
    setPageError(null);
    clearContextError();

    try {
      const matchData = await fetchMatchFromApi(matchId);
      if (!matchData) {
        setPageError("Match not found.");
        setPageLoading(false);
        return;
      }
      setMatch(matchData);

      // Try to find teams from context first, assuming they are loaded by DataProvider
      const teamAData = findTeamById(matchData.teamAId) || allTeamsFromContext.find(t=>t.id === matchData.teamAId);
      const teamBData = findTeamById(matchData.teamBId) || allTeamsFromContext.find(t=>t.id === matchData.teamBId);
      setTeamA(teamAData || null);
      setTeamB(teamBData || null);
      
      const scorecardData = await fetchScorecardByMatchId(matchId);
      setScorecard(scorecardData);

    } catch (err: any) {
      setPageError(err.message || "Failed to load scorecard details.");
    } finally {
      setPageLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, fetchMatchFromApi, fetchScorecardByMatchId, findTeamById, allTeamsFromContext, clearContextError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if(contextError) {
        setPageError(contextError);
    }
  }, [contextError]);

  const getPlayerName = (playerId: string): string => {
    const player = allPlayersFromContext.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
  };

  const renderInnings = (innings: Innings | undefined | null, inningsTitle: string) => {
    if (!innings) return <p>Innings not played or data unavailable.</p>;
    const battingTeamName = innings.battingTeamId === teamA?.id ? teamA?.name : teamB?.name;

    return (
      <Card title={`${inningsTitle}: ${battingTeamName} - ${innings.score}/${innings.wickets} (${innings.oversPlayed.toFixed(1)} Overs)`} className="mb-6">
        <h4 className="font-semibold mt-2 mb-1 text-sm">Timeline (Last 10 balls):</h4>
        <div className="text-xs space-y-0.5 max-h-48 overflow-y-auto">
            {innings.balls.length > 0 ? 
                innings.balls.slice(-10).reverse().map((ball, idx) => (
                <p key={idx} className="border-b border-gray-100 py-0.5">
                    {ball.over}.{ball.ballInOver}: {getPlayerName(ball.batsmanId)} faced {getPlayerName(ball.bowlerId)} - {ball.runsScored} run{ball.runsScored !== 1 ? 's':''}{ball.extras.type ? ` (${ball.extras.type})` : ''}{ball.wicket ? ` WICKET! (${ball.wicket.type} ${getPlayerName(ball.wicket.playerId)})` : ''}
                </p>
                )) : <p className="text-gray-500">No balls recorded for this innings.</p>
            }
        </div>
        <p className="mt-2 text-xs text-gray-500">Note: This is a simplified ball-by-ball view. Full batsman/bowler stats breakdown not shown.</p>
      </Card>
    );
  };

  const isLoading = pageLoading || contextLoadingMatches || contextLoadingScorecards;

  if (isLoading) return <div className="flex justify-center items-center h-screen">{ICONS.SPINNER} Loading scorecard...</div>;
  if (pageError) return <div className="text-red-500 text-center p-4">{ICONS.WARNING} Error: {pageError} <Button onClick={() => {setPageError(null); loadData();}} size="sm">Retry</Button></div>;
  if (!match) return <div className="text-center p-4">Match data not found.</div>;

  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-900">{teamA?.name || 'Team A'} vs {teamB?.name || 'Team B'}</h1>
        <p className="text-sm text-gray-500">{new Date(match.dateTime).toLocaleString()} at {match.venue}</p>
        {match.result && <p className="text-lg font-semibold text-blue-600 mt-1">Result: {match.result}</p>}
      </header>

      {!scorecard && <Card><p className="text-gray-600 text-center py-4">Scorecard not yet available for this match or still loading.</p></Card>}
      
      {scorecard && renderInnings(scorecard.innings1, "1st Innings")}
      {scorecard?.innings2 && renderInnings(scorecard.innings2, "2nd Innings")}
    </div>
  );
};

export default ViewScorecardPage;
