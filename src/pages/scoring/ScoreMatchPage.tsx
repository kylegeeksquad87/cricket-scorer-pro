
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Player, Team, Scorecard, Innings, Ball, MatchStatus } from '../../types';
import { useData } from '../../contexts/DataContext';
// import * as api from '../../services/mockApiService'; // Replaced by DataContext calls
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS } from '../../constants';

// Helper component for player selection
interface PlayerSelectionProps {
  players: Player[];
  selectedPlayers: string[];
  onSelectPlayer: (playerId: string) => void;
  limit: number;
  teamName: string;
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({ players, selectedPlayers, onSelectPlayer, limit, teamName }) => {
  return (
    <div>
      <h4 className="text-md font-semibold mb-2">Select Playing XI for {teamName} (Selected: {selectedPlayers.length}/{limit})</h4>
      <div className="max-h-60 overflow-y-auto border rounded p-2 grid grid-cols-2 gap-2">
        {players.map(player => (
          <label key={player.id} className={`p-2 rounded border cursor-pointer ${selectedPlayers.includes(player.id) ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}>
            <input 
              type="checkbox" 
              checked={selectedPlayers.includes(player.id)}
              onChange={() => onSelectPlayer(player.id)}
              disabled={selectedPlayers.length >= limit && !selectedPlayers.includes(player.id)}
              className="mr-2"
            />
            {player.firstName} {player.lastName}
          </label>
        ))}
      </div>
    </div>
  );
};


const ScoreMatchPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { 
    fetchMatchById: fetchMatchFromApi, // Renamed to avoid conflict with local 'match' state
    findTeamById, // Keep for client-side team lookup once teams are loaded
    fetchPlayers, // To get players for teams
    players: allPlayersFromContext, // Get all players for lookups
    teams: allTeamsFromContext, // Get all teams for lookups
    fetchScorecardByMatchId, 
    updateMatch: updateMatchApi, 
    updateScorecard: updateScorecardApi,
    loadingMatches: contextLoadingMatches, 
    loadingPlayers: contextLoadingPlayers,
    loadingScorecards: contextLoadingScorecards,
    error: contextError,
    clearError: clearContextError,
  } = useData();

  const [match, setMatch] = useState<Match | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  
  const [pageLoading, setPageLoading] = useState(true); // Specific loading for this page's aggregate data
  const [pageError, setPageError] = useState<string | null>(null);

  // Pre-match setup states
  const [setupStep, setSetupStep] = useState<'initial' | 'playingXI' | 'toss' | 'inningsSelection' | 'scoring'>('initial');
  const [playingXI_A, setPlayingXI_A] = useState<string[]>([]);
  const [playingXI_B, setPlayingXI_B] = useState<string[]>([]);
  const [tossWonBy, setTossWonBy] = useState<string | null>(null); // teamId
  const [choseTo, setChoseTo] = useState<'Bat' | 'Bowl' | null>(null);
  const [battingTeamId, setBattingTeamId] = useState<string | null>(null);
  const [bowlingTeamId, setBowlingTeamId] = useState<string | null>(null);
  
  // Current Inning states
  const [strikerId, setStrikerId] = useState<string | null>(null);
  const [nonStrikerId, setNonStrikerId] = useState<string | null>(null);
  const [currentBowlerId, setCurrentBowlerId] = useState<string | null>(null);
  const [currentInnings, setCurrentInnings] = useState<Innings | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const loadMatchDetails = useCallback(async () => {
    if (!matchId) {
      setPageError("Match ID is missing.");
      setPageLoading(false);
      return;
    }
    setPageLoading(true);
    clearContextError(); // Clear previous errors from context
    setPageError(null);

    try {
      const matchData = await fetchMatchFromApi(matchId);
      if (!matchData) {
        setPageError("Match not found.");
        navigate("/scoring");
        return;
      }
      setMatch(matchData);

      // Fetch players for each team (assuming allPlayersFromContext is populated by DataProvider)
      // This might be redundant if DataProvider's fetchPlayers is already called with specific team IDs elsewhere
      // Or if teams data from context already includes player lists (depends on API design)
      // For now, let's assume we need to filter/fetch specifically
      const teamAData = findTeamById(matchData.teamAId) || allTeamsFromContext.find(t=>t.id === matchData.teamAId);
      const teamBData = findTeamById(matchData.teamBId) || allTeamsFromContext.find(t=>t.id === matchData.teamBId);

      setTeamA(teamAData || null);
      setTeamB(teamBData || null);

      if (teamAData) {
          // If allPlayersFromContext doesn't guarantee players for a specific team, we'd fetchPlayers(teamAData.id)
          setTeamAPlayers(allPlayersFromContext.filter(p => p.teamIds.includes(teamAData.id)));
      }
      if (teamBData) {
          setTeamBPlayers(allPlayersFromContext.filter(p => p.teamIds.includes(teamBData.id)));
      }
      
      const scorecardData = await fetchScorecardByMatchId(matchId); // matchData.scorecardId might not be reliable if creating new
      setScorecard(scorecardData);
      
      if (scorecardData) {
        if (scorecardData.innings1 && !scorecardData.innings2) {
            setCurrentInnings(scorecardData.innings1);
            setBattingTeamId(scorecardData.innings1.battingTeamId);
            setBowlingTeamId(scorecardData.innings1.bowlingTeamId);
        } else if (scorecardData.innings2) {
            setCurrentInnings(scorecardData.innings2);
            setBattingTeamId(scorecardData.innings2.battingTeamId);
            setBowlingTeamId(scorecardData.innings2.bowlingTeamId);
        }
         // Restore player selections if available
        if (scorecardData.innings1?.balls?.length > 0) {
            const lastBall = scorecardData.innings1.balls[scorecardData.innings1.balls.length-1];
            setStrikerId(lastBall.batsmanId);
            setNonStrikerId(lastBall.nonStrikerId);
            setCurrentBowlerId(lastBall.bowlerId);
        }
        setSetupStep('scoring');
      } else if (matchData.status === MatchStatus.LIVE && matchData.tossWonByTeamId && matchData.choseTo) {
         setTossWonBy(matchData.tossWonByTeamId);
         setChoseTo(matchData.choseTo);
         if (matchData.tossWonByTeamId === matchData.teamAId) {
            setBattingTeamId(matchData.choseTo === 'Bat' ? matchData.teamAId : matchData.teamBId);
            setBowlingTeamId(matchData.choseTo === 'Bat' ? matchData.teamBId : matchData.teamAId);
         } else {
            setBattingTeamId(matchData.choseTo === 'Bat' ? matchData.teamBId : matchData.teamAId);
            setBowlingTeamId(matchData.choseTo === 'Bat' ? matchData.teamAId : matchData.teamBId);
         }
         // TODO: Restore playing XI if saved on matchData (not currently in type)
         // For now, if live but no scorecard, might need to re-select players for innings
         setSetupStep('inningsSelection'); 
      } else {
         setSetupStep('playingXI');
      }

    } catch (err: any) {
      setPageError(err.message || "Failed to load match details.");
    } finally {
      setPageLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, navigate, fetchMatchFromApi, findTeamById, fetchScorecardByMatchId, allPlayersFromContext, allTeamsFromContext, clearContextError]);


  useEffect(() => {
    // If teams or players aren't loaded in context yet, DataProvider's initial fetch should handle it.
    // We might want to ensure fetchPlayers() is called in DataProvider or here if context doesn't have them.
    if(allTeamsFromContext.length === 0 || allPlayersFromContext.length === 0) {
        // Data provider should be fetching these, this is a fallback / indicator
        // console.warn("ScoreMatchPage: Teams or Players not yet loaded in context.");
    }
    fetchPlayers(); // Ensure players are loaded
    loadMatchDetails();
  }, [loadMatchDetails, fetchPlayers, allTeamsFromContext.length, allPlayersFromContext.length]);

  useEffect(() => {
    if (contextError) {
        setPageError(contextError);
    }
  }, [contextError]);


  const handlePlayerSelect = (team: 'A' | 'B', playerId: string) => {
    const limit = 11;
    if (team === 'A') {
      setPlayingXI_A(prev => 
        prev.includes(playerId) ? prev.filter(id => id !== playerId) : (prev.length < limit ? [...prev, playerId] : prev)
      );
    } else {
      setPlayingXI_B(prev => 
        prev.includes(playerId) ? prev.filter(id => id !== playerId) : (prev.length < limit ? [...prev, playerId] : prev)
      );
    }
  };

  const confirmPlayingXI = async () => {
    if (playingXI_A.length !== 11 || playingXI_B.length !== 11) {
      alert("Please select 11 players for each team.");
      return;
    }
    if (match && matchId) {
      // NOTE: Storing playing XI directly on match object is simplified.
      // A more robust solution might involve the scorecard or a separate "match_players" table.
      // For now, we update the local match state. Backend update is optional for this step.
      try {
        await updateMatchApi(matchId, { 
            // playingTeamA and playingTeamB are not directly on Match type for DB storage usually.
            // This is more of a transient state for the scoring page.
            // If backend needs this, it should be handled there.
        });
        console.log("Playing XI confirmed (local state):", playingXI_A, playingXI_B);
        // Update local match state if it had these fields, for now, just proceed
        setMatch(prev => prev ? {
            ...prev, 
            playingTeamA: playingXI_A.map(id => teamAPlayers.find(p=>p.id === id)!), // For UI use
            playingTeamB: playingXI_B.map(id=> teamBPlayers.find(p=>p.id === id)!)  // For UI use
        } : null);
        setSetupStep('toss');
      } catch (err: any) {
         setPageError(err.message || "Failed to save playing XI");
      }
    }
  };

  const confirmToss = async () => {
    if (!tossWonBy || !choseTo || !match || !matchId) return;
    try {
        await updateMatchApi(matchId, { tossWonByTeamId: tossWonBy, choseTo });
        console.log("Toss confirmed and saved.");
        setMatch(prev => prev ? {...prev, tossWonByTeamId: tossWonBy, choseTo } : null);

        if (teamA && teamB) { // Ensure teams are loaded
            if (tossWonBy === teamA.id) {
            setBattingTeamId(choseTo === 'Bat' ? teamA.id : teamB.id);
            setBowlingTeamId(choseTo === 'Bat' ? teamB.id : teamA.id);
            } else {
            setBattingTeamId(choseTo === 'Bat' ? teamB.id : teamA.id);
            setBowlingTeamId(choseTo === 'Bat' ? teamA.id : teamB.id);
            }
        }
        setSetupStep('inningsSelection');
    } catch (err: any) {
        setPageError(err.message || "Failed to save toss details");
    }
  };
  
  const startInnings = async () => {
    if (!match || !matchId || !battingTeamId || !bowlingTeamId || !strikerId || !nonStrikerId || !currentBowlerId) {
        alert("Please select batting team, bowling team, striker, non-striker, and bowler.");
        return;
    }

    let currentScorecard = scorecard;
    const isNewScorecard = !currentScorecard;
    const isSecondInnings = currentScorecard && currentScorecard.innings1 && !currentScorecard.innings2 && currentScorecard.innings1.battingTeamId !== battingTeamId;

    if (isNewScorecard) {
        currentScorecard = {
            id: `sc_${match.id}`, 
            matchId: match.id,
            innings1: { battingTeamId, bowlingTeamId, score: 0, wickets: 0, oversPlayed: 0, balls: [] }
        };
    } else if (isSecondInnings && currentScorecard) { // currentScorecard is not null here
        currentScorecard.innings2 = { battingTeamId, bowlingTeamId, score: 0, wickets: 0, oversPlayed: 0, balls: [] };
    }
    
    const inningsToScore = currentScorecard?.innings2 || currentScorecard?.innings1;
    if (!inningsToScore) {
        setPageError("Error initializing innings.");
        return;
    }

    setCurrentInnings(inningsToScore);
    setScorecard(currentScorecard); // currentScorecard is guaranteed to be non-null here
    
    try {
        if (currentScorecard) { // Ensure currentScorecard is not null before updating
            await updateScorecardApi(currentScorecard);
        }
        await updateMatchApi(matchId, { status: MatchStatus.LIVE, scorecardId: currentScorecard?.id });
        console.log("Innings started. Scorecard updated.");
        setMatch(prev => prev ? {...prev, status: MatchStatus.LIVE, scorecardId: currentScorecard?.id} : null);
        setSetupStep('scoring');
    } catch (err: any) {
        setPageError(err.message || "Failed to start innings or update scorecard.");
    }
  };

  const recordBall = async (runs: number, isExtra: boolean = false, extraType?: 'Wd' | 'Nb' | 'Lb' | 'B', wicket?: any) => {
    if (!currentInnings || !strikerId || !nonStrikerId || !currentBowlerId || !match || !scorecard) {
        setPageError("Cannot record ball: Missing critical match/player/innings data.");
        return;
    }

    const newBall: Ball = {
        over: Math.floor(currentInnings.oversPlayed),
        ballInOver: Math.round((currentInnings.oversPlayed - Math.floor(currentInnings.oversPlayed)) * 10) + 1,
        batsmanId: strikerId,
        nonStrikerId: nonStrikerId,
        bowlerId: currentBowlerId,
        runsScored: runs,
        extras: isExtra ? { type: extraType, runs: (extraType === 'Wd' || extraType === 'Nb') ? runs : 0 } : {},
        wicket: wicket
    };

    const updatedInnings = { ...currentInnings };
    updatedInnings.balls.push(newBall);
    updatedInnings.score += runs; // TODO: Refine for extras (Lb/B don't go to batsman but to team score)
    
    if (!isExtra || extraType === 'Lb' || extraType === 'B' || extraType === 'Nb') { // Wd doesn't count as ball faced or ball in over progression
      if (updatedInnings.balls.filter(b => b.over === newBall.over && (!b.extras.type || (b.extras.type !== 'Wd'))).length % 6 === 0 && newBall.ballInOver !== 0) {
        updatedInnings.oversPlayed = Math.floor(updatedInnings.oversPlayed) + 1;
      } else {
        updatedInnings.oversPlayed = parseFloat((Math.floor(updatedInnings.oversPlayed) + (newBall.ballInOver / 10)).toFixed(1));
      }
    }
    
    if (wicket) updatedInnings.wickets +=1;

    setCurrentInnings(updatedInnings);
    
    let updatedScorecard = { ...scorecard };
    if (updatedScorecard.innings2 && updatedScorecard.innings2.battingTeamId === battingTeamId) {
        updatedScorecard.innings2 = updatedInnings;
    } else {
        updatedScorecard.innings1 = updatedInnings;
    }
    setScorecard(updatedScorecard);
    
    try {
        await updateScorecardApi(updatedScorecard);
        console.log("Ball recorded & scorecard updated:", newBall);
    } catch (err: any) {
        setPageError(err.message || "Failed to update scorecard after recording ball.");
        // Potentially revert local state changes if API call fails critically
    }

    if (runs % 2 !== 0 && (!isExtra || (extraType !== 'Wd' && extraType !== 'Nb'))) {
        const temp = strikerId;
        setStrikerId(nonStrikerId);
        setNonStrikerId(temp);
    }
    // TODO: Handle end of over (change bowler, swap strikers automatically)
    // TODO: Handle end of innings (wickets or overs)
  };
  
  const openPlayerSelectionModal = (forTeam: 'striker' | 'nonStriker' | 'bowler') => {
    let availablePlayersList: Player[] = [];
    let currentSelection: string | null = null;
    let title = '';

    const currentBattingTeamPlayers = battingTeamId === teamA?.id ? teamAPlayers.filter(p => playingXI_A.includes(p.id)) : teamBPlayers.filter(p => playingXI_B.includes(p.id));
    const currentBowlingTeamPlayers = bowlingTeamId === teamA?.id ? teamAPlayers.filter(p => playingXI_A.includes(p.id)) : teamBPlayers.filter(p => playingXI_B.includes(p.id));

    if (forTeam === 'striker' || forTeam === 'nonStriker') {
        availablePlayersList = currentBattingTeamPlayers;
        currentSelection = forTeam === 'striker' ? strikerId : nonStrikerId;
        title = `Select ${forTeam === 'striker' ? "Striker" : "Non-Striker"}`;
    } else { // bowler
        availablePlayersList = currentBowlingTeamPlayers;
        currentSelection = currentBowlerId;
        title = "Select Bowler";
    }
    
    setModalContent(
        <div>
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {availablePlayersList.map(p => (
                <Button
                    key={p.id}
                    variant={currentSelection === p.id ? 'primary' : 'secondary'}
                    onClick={() => {
                        if (forTeam === 'striker') setStrikerId(p.id);
                        else if (forTeam === 'nonStriker') setNonStrikerId(p.id);
                        else setCurrentBowlerId(p.id);
                        setIsModalOpen(false);
                    }}
                    disabled={ (forTeam === 'striker' && p.id === nonStrikerId) || (forTeam === 'nonStriker' && p.id === strikerId) }
                >
                    {p.firstName} {p.lastName}
                </Button>
            ))}
            </div>
        </div>
    );
    setIsModalOpen(true);
  };

  const isLoading = pageLoading || contextLoadingMatches || contextLoadingPlayers || contextLoadingScorecards;

  if (isLoading) return <div className="flex justify-center items-center h-screen">{ICONS.SPINNER} Loading match details...</div>;
  if (pageError) return <div className="text-red-500 text-center p-4">{ICONS.WARNING} Error: {pageError} <Button onClick={() => { setPageError(null); clearContextError(); loadMatchDetails();}} size="sm">Retry</Button></div>;
  if (!match || !teamA || !teamB) return <div className="text-center p-4">Match data incomplete. Ensure teams and players are loaded.</div>;

  const battingTeamDetails = battingTeamId === teamA.id ? teamA : teamB;
  const bowlingTeamDetails = bowlingTeamId === teamA.id ? teamA : teamB;
  
  const strikerDetails = (battingTeamId === teamA.id ? teamAPlayers : teamBPlayers).find(p => p.id === strikerId);
  const nonStrikerDetails = (battingTeamId === teamA.id ? teamAPlayers : teamBPlayers).find(p => p.id === nonStrikerId);
  const bowlerDetails = (bowlingTeamId === teamA.id ? teamAPlayers : teamBPlayers).find(p => p.id === currentBowlerId);
  
  const tossWinnerName = tossWonBy === teamA?.id ? teamA?.name : (tossWonBy === teamB?.id ? teamB?.name : 'Selected Team');

  if (setupStep === 'playingXI') {
    return (
      <Card title="Setup Match: Playing XI" className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <PlayerSelection players={teamAPlayers} selectedPlayers={playingXI_A} onSelectPlayer={(id) => handlePlayerSelect('A', id)} limit={11} teamName={teamA.name} />
          <PlayerSelection players={teamBPlayers} selectedPlayers={playingXI_B} onSelectPlayer={(id) => handlePlayerSelect('B', id)} limit={11} teamName={teamB.name} />
          <Button onClick={confirmPlayingXI} disabled={playingXI_A.length !== 11 || playingXI_B.length !== 11}>Confirm Playing XI</Button>
        </div>
      </Card>
    );
  }

  if (setupStep === 'toss') {
     return (
      <Card title="Setup Match: Coin Toss" className="max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Toss Won By:</label>
            <select value={tossWonBy || ''} onChange={(e) => setTossWonBy(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md bg-white">
              <option value="" disabled>Select Team</option>
              <option value={teamA.id}>{teamA.name}</option>
              <option value={teamB.id}>{teamB.name}</option>
            </select>
          </div>
          {tossWonBy && (
            <div>
              <label className="block text-sm font-medium text-gray-700">{tossWinnerName} chose to:</label>
              <select value={choseTo || ''} onChange={(e) => setChoseTo(e.target.value as 'Bat' | 'Bowl')} className="mt-1 block w-full p-2 border-gray-300 rounded-md bg-white">
                <option value="" disabled>Select Choice</option>
                <option value="Bat">Bat</option>
                <option value="Bowl">Bowl</option>
              </select>
            </div>
          )}
          <Button onClick={confirmToss} disabled={!tossWonBy || !choseTo}>Confirm Toss & Proceed</Button>
        </div>
      </Card>
     );
  }
  
  if (setupStep === 'inningsSelection') {
    return (
        <Card title={`Starting Innings for ${battingTeamDetails?.name}`} className="max-w-lg mx-auto">
            <p className="mb-2">{battingTeamDetails?.name} to Bat, {bowlingTeamDetails?.name} to Bowl.</p>
            <div className="space-y-3">
                <Button onClick={() => openPlayerSelectionModal('striker')} className="w-full justify-start">
                    Striker: {strikerDetails ? `${strikerDetails.firstName} ${strikerDetails.lastName}` : 'Select Striker'}
                </Button>
                <Button onClick={() => openPlayerSelectionModal('nonStriker')} className="w-full justify-start">
                    Non-Striker: {nonStrikerDetails ? `${nonStrikerDetails.firstName} ${nonStrikerDetails.lastName}` : 'Select Non-Striker'}
                </Button>
                <Button onClick={() => openPlayerSelectionModal('bowler')} className="w-full justify-start">
                    Bowler: {bowlerDetails ? `${bowlerDetails.firstName} ${bowlerDetails.lastName}` : 'Select Bowler'}
                </Button>
            </div>
            <Button onClick={startInnings} disabled={!strikerId || !nonStrikerId || !currentBowlerId} className="mt-4 w-full">
                Start Innings
            </Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Select Player">
                {modalContent}
            </Modal>
        </Card>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
      <div className="md:w-2/3 bg-white p-4 shadow rounded-lg overflow-y-auto">
        <h2 className="text-xl font-semibold mb-3">Score Input</h2>
        <Card className="mb-4">
            <div className="grid grid-cols-2 gap-x-4">
                <div><strong>Striker:</strong> {strikerDetails ? `${strikerDetails.firstName} ${strikerDetails.lastName}` : 'N/A'}</div>
                <div><strong>Non-Striker:</strong> {nonStrikerDetails ? `${nonStrikerDetails.firstName} ${nonStrikerDetails.lastName}` : 'N/A'}</div>
                <div className="col-span-2"><strong>Bowler:</strong> {bowlerDetails ? `${bowlerDetails.firstName} ${bowlerDetails.lastName}` : 'N/A'} ({currentInnings?.oversPlayed || 0} ov)</div>
            </div>
        </Card>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[0, 1, 2, 3, 4, 5, 6].map(runs => (
            <Button key={runs} onClick={() => recordBall(runs)} variant="primary" className="py-3 text-lg">{runs}</Button>
          ))}
          <Button onClick={() => recordBall(1, true, 'Wd')} variant="secondary" className="py-3">Wd</Button>
          <Button onClick={() => recordBall(1, true, 'Nb')} variant="secondary" className="py-3">Nb</Button>
          <Button onClick={() => recordBall(0, false, undefined, {type: 'Bowled', playerId: strikerId})} variant="danger" className="py-3 col-span-1">Wicket</Button>
          <Button onClick={() => { /* TODO: Undo logic */ }} variant="ghost" className="py-3 col-span-1" leftIcon={ICONS.ARROW_LEFT}>Undo</Button>
        </div>
      </div>

      <div className="md:w-1/3 bg-white p-4 shadow rounded-lg overflow-y-auto">
        <h2 className="text-xl font-semibold mb-3">Live Scoreboard</h2>
        <Card>
          <div className="text-center mb-2">
            <h3 className="text-2xl font-bold">{battingTeamDetails?.name}</h3>
            <p className="text-4xl font-bold my-1">{currentInnings?.score || 0} / {currentInnings?.wickets || 0}</p>
            <p className="text-lg">Overs: {currentInnings?.oversPlayed.toFixed(1) || '0.0'} ({match.overs})</p>
          </div>
          <hr className="my-3"/>
          <div className="text-sm space-y-1">
            <p><strong>Striker:</strong> {strikerDetails ? `${strikerDetails.firstName} ${strikerDetails.lastName}` : 'N/A'} - Runs: X (Balls: Y)</p>
            <p><strong>Non-Striker:</strong> {nonStrikerDetails ? `${nonStrikerDetails.firstName} ${nonStrikerDetails.lastName}` : 'N/A'} - Runs: X (Balls: Y)</p>
            <p><strong>Bowler:</strong> {bowlerDetails ? `${bowlerDetails.firstName} ${bowlerDetails.lastName}` : 'N/A'} - X / Y (Overs: Z)</p>
          </div>
        </Card>
        <Card title="Recent Balls" className="mt-4">
            <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
                {currentInnings?.balls.slice(-10).reverse().map((ball, index) => (
                    <p key={index} className="border-b pb-1 mb-1">
                        {ball.over}.{ball.ballInOver}: {ball.runsScored} run{ball.runsScored !== 1 ? 's' : ''}
                        {ball.extras.type && ` (${ball.extras.type})`}
                        {ball.wicket && ` WICKET! (${ball.wicket.type})`}
                    </p>
                ))}
                {currentInnings?.balls.length === 0 && <p className="text-gray-500">No balls recorded yet.</p>}
            </div>
        </Card>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Select Player">
        {modalContent}
      </Modal>
    </div>
  );
};

export default ScoreMatchPage;
