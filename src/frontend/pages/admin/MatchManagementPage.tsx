
import React, { useState, useEffect } from 'react';
import { Match, MatchFormData, MatchStatus, Team, League } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS, DEFAULT_OVERS } from '../../constants';

const MatchManagementPage: React.FC = () => {
  const { 
    matches, teams, leagues, 
    fetchMatches, fetchTeams, fetchLeagues, 
    addMatch, updateMatch, deleteMatch, 
    loadingData, error, clearError 
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMatchData, setCurrentMatchData] = useState<Partial<MatchFormData>>({});
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  
  const [selectedLeagueIdForForm, setSelectedLeagueIdForForm] = useState<string>('');


  useEffect(() => {
    fetchLeagues();
    fetchTeams(); 
    fetchMatches(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leagues.length > 0 && !selectedLeagueIdForForm) {
      setSelectedLeagueIdForForm(leagues[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagues]);


  const openCreateModal = () => {
    if (leagues.length === 0) {
        alert("Please create a league first.");
        return;
    }
    clearError();
    setEditingMatch(null);
    const defaultLeagueId = selectedLeagueIdForForm || (leagues.length > 0 ? leagues[0].id : '');
    const leagueTeams = teams.filter(t => t.leagueId === defaultLeagueId);

    setCurrentMatchData({
      leagueId: defaultLeagueId,
      teamAId: leagueTeams.length > 0 ? leagueTeams[0].id : '',
      teamBId: leagueTeams.length > 1 ? leagueTeams[1].id : '',
      dateTime: new Date().toISOString().substring(0, 16), // For datetime-local format
      venue: '',
      overs: DEFAULT_OVERS,
      status: MatchStatus.SCHEDULED, // Default status for new match
    });
    if(defaultLeagueId) setSelectedLeagueIdForForm(defaultLeagueId);
    setIsModalOpen(true);
  };

  const openEditModal = (match: Match) => {
    clearError();
    setEditingMatch(match);
    setSelectedLeagueIdForForm(match.leagueId); 
    // Ensure all fields from MatchFormData are populated for the form
    setCurrentMatchData({
        leagueId: match.leagueId,
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        dateTime: new Date(match.dateTime).toISOString().substring(0,16), // Format for datetime-local
        venue: match.venue,
        overs: match.overs,
        status: match.status,
        tossWonByTeamId: match.tossWonByTeamId,
        choseTo: match.choseTo,
        umpire1: match.umpire1,
        umpire2: match.umpire2,
        result: match.result,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMatchData({});
    setEditingMatch(null);
    clearError();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setCurrentMatchData(prev => {
          const updatedData = { ...prev, [name]: name === 'overs' ? parseInt(value, 10) : value };
          if (name === "leagueId") {
            setSelectedLeagueIdForForm(value); 
            // When league changes in form, reset team selections as they might not belong to new league
            const leagueTeams = teams.filter(t => t.leagueId === value);
            updatedData.teamAId = leagueTeams.length > 0 ? leagueTeams[0].id : '';
            updatedData.teamBId = leagueTeams.length > 1 ? leagueTeams[1].id : '';
          }
          return updatedData;
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatchData.leagueId || !currentMatchData.teamAId || !currentMatchData.teamBId || currentMatchData.teamAId === currentMatchData.teamBId) {
        alert("Please select a league and two different teams for the match.");
        return;
    }
    try {
      // Ensure all required fields for MatchFormData are present
      const payload: MatchFormData = {
        leagueId: currentMatchData.leagueId!,
        teamAId: currentMatchData.teamAId!,
        teamBId: currentMatchData.teamBId!,
        dateTime: new Date(currentMatchData.dateTime!).toISOString(), // Ensure full ISO string
        venue: currentMatchData.venue!,
        overs: currentMatchData.overs!,
        status: currentMatchData.status || MatchStatus.SCHEDULED, 
        // Optional fields
        tossWonByTeamId: currentMatchData.tossWonByTeamId || undefined,
        choseTo: currentMatchData.choseTo || undefined,
        umpire1: currentMatchData.umpire1 || undefined,
        umpire2: currentMatchData.umpire2 || undefined,
        result: currentMatchData.result || undefined,
      };

      if (editingMatch) {
        await updateMatch(editingMatch.id, payload);
      } else {
        await addMatch(payload);
      }
      handleCloseModal();
      fetchMatches(); // Re-fetch matches to update list
    } catch (err) {
      console.error("Failed to save match:", err);
      // Error is set in DataContext
    }
  };
  
  const handleDeleteConfirm = (match: Match) => {
    clearError();
    setMatchToDelete(match);
  };

  const handleDelete = async () => {
    if (!matchToDelete) return;
    try {
      await deleteMatch(matchToDelete.id);
      setMatchToDelete(null);
      fetchMatches(); // Re-fetch matches
    } catch (err) {
      console.error("Failed to delete match:", err);
      // Error is set in DataContext
    }
  };
  
  const getTeamName = (teamId?: string): string => teams.find(t => t.id === teamId)?.name || 'N/A';
  const getLeagueName = (leagueId?: string): string => leagues.find(l => l.id === leagueId)?.name || 'N/A';
  
  const teamsInSelectedFormLeague = teams.filter(team => team.leagueId === (currentMatchData.leagueId || selectedLeagueIdForForm));


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Matches</h1>
        <Button onClick={openCreateModal} leftIcon={ICONS.PLUS} disabled={leagues.length === 0}>Create Match</Button>
      </div>

      {loadingData && !isModalOpen && !matchToDelete && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading matches...</p>}
      
      {!loadingData && matches.length === 0 && !isModalOpen && !matchToDelete &&(
        <Card><p className="text-gray-600 text-center py-4">No matches found. Create one!</p></Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <Card key={match.id} title={`${getTeamName(match.teamAId)} vs ${getTeamName(match.teamBId)}`}>
            <p className="text-sm text-gray-600"><strong>League:</strong> {getLeagueName(match.leagueId)}</p>
            <p className="text-sm text-gray-600"><strong>Date:</strong> {new Date(match.dateTime).toLocaleString()}</p>
            <p className="text-sm text-gray-600"><strong>Venue:</strong> {match.venue}</p>
            <p className="text-sm text-gray-600"><strong>Overs:</strong> {match.overs}</p>
            <p className="text-sm text-gray-600"><strong>Status:</strong> {match.status}</p>
            {match.result && <p className="text-sm text-gray-600"><strong>Result:</strong> {match.result}</p>}
            <div className="mt-4 space-x-2">
              <Button size="sm" variant="ghost" leftIcon={ICONS.EDIT} onClick={() => openEditModal(match)}>Edit</Button>
              <Button size="sm" variant="danger" leftIcon={ICONS.DELETE} onClick={() => handleDeleteConfirm(match)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {isModalOpen && currentMatchData && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMatch ? "Edit Match" : "Create New Match"} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded flex items-center"><span className="mr-2">{ICONS.WARNING}</span>{error}</p>}
            <div>
              <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700">League</label>
              <select id="leagueId" name="leagueId" value={currentMatchData.leagueId || selectedLeagueIdForForm} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white" disabled={leagues.length === 0}>
                {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="teamAId" className="block text-sm font-medium text-gray-700">Team A</label>
              <select id="teamAId" name="teamAId" value={currentMatchData.teamAId || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white" disabled={teamsInSelectedFormLeague.length === 0}>
                <option value="">Select Team A</option>
                {teamsInSelectedFormLeague.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="teamBId" className="block text-sm font-medium text-gray-700">Team B</label>
              <select id="teamBId" name="teamBId" value={currentMatchData.teamBId || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white" disabled={teamsInSelectedFormLeague.length === 0}>
                <option value="">Select Team B</option>
                {teamsInSelectedFormLeague.filter(t => t.id !== currentMatchData.teamAId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <Input label="Date & Time" name="dateTime" type="datetime-local" value={currentMatchData.dateTime || ''} onChange={handleChange} required />
            <Input label="Venue" name="venue" value={currentMatchData.venue || ''} onChange={handleChange} required />
            <Input label="Overs" name="overs" type="number" value={currentMatchData.overs?.toString() || DEFAULT_OVERS.toString()} onChange={handleChange} required min="1" />
            
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" value={currentMatchData.status || MatchStatus.SCHEDULED} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                    {Object.values(MatchStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <Input label="Umpire 1 (Optional)" name="umpire1" value={currentMatchData.umpire1 || ''} onChange={handleChange} />
            <Input label="Umpire 2 (Optional)" name="umpire2" value={currentMatchData.umpire2 || ''} onChange={handleChange} />
            <div>
              <label htmlFor="tossWonByTeamId" className="block text-sm font-medium text-gray-700">Toss Won By (Optional)</label>
              <select name="tossWonByTeamId" value={currentMatchData.tossWonByTeamId || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                  <option value="">Select Team</option>
                  {currentMatchData.teamAId && teams.find(t => t.id === currentMatchData.teamAId) && <option value={currentMatchData.teamAId}>{getTeamName(currentMatchData.teamAId)}</option>}
                  {currentMatchData.teamBId && teams.find(t => t.id === currentMatchData.teamBId) && <option value={currentMatchData.teamBId}>{getTeamName(currentMatchData.teamBId)}</option>}
              </select>
            </div>
            {currentMatchData.tossWonByTeamId && <div>
                <label htmlFor="choseTo" className="block text-sm font-medium text-gray-700">Chose To (Optional)</label>
                <select name="choseTo" value={currentMatchData.choseTo || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                    <option value="">Select Choice</option>
                    <option value="Bat">Bat</option>
                    <option value="Bowl">Bowl</option>
                </select>
            </div>}
            <Input label="Result (Optional)" name="result" value={currentMatchData.result || ''} onChange={handleChange} />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" isLoading={loadingData}>Save Match</Button>
            </div>
          </form>
        </Modal>
      )}

      {matchToDelete && (
        <Modal isOpen={true} onClose={() => {setMatchToDelete(null); clearError();}} title="Confirm Delete">
            <p>Are you sure you want to delete the match between <strong>{getTeamName(matchToDelete.teamAId)}</strong> and <strong>{getTeamName(matchToDelete.teamBId)}</strong> on {new Date(matchToDelete.dateTime).toLocaleDateString()}? This action cannot be undone.</p>
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded mt-2 flex items-center"><span className="mr-2">{ICONS.WARNING}</span> {error}</p>}
            <div className="flex justify-end space-x-3 pt-4 mt-4">
                <Button variant="secondary" onClick={() => {setMatchToDelete(null); clearError();}}>Cancel</Button>
                <Button variant="danger" onClick={handleDelete} isLoading={loadingData}>Delete Match</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default MatchManagementPage;
