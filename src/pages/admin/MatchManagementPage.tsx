
import React, { useState, useEffect } from 'react';
import { Match, MatchFormData, Team, League } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS, DEFAULT_OVERS } from '../../constants';

const MatchManagementPage: React.FC = () => {
  const { matches, teams, leagues, fetchMatches, fetchTeams, fetchLeagues, addMatch, loadingData, error } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<MatchFormData | null>(null);
  const [selectedLeagueIdForForm, setSelectedLeagueIdForForm] = useState<string>('');

  useEffect(() => {
    fetchLeagues();
    fetchTeams(); // Fetch all teams for dropdowns
    fetchMatches(); // Fetch all matches initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    if (leagues.length === 0) {
        alert("Please create a league first.");
        return;
    }
    const defaultLeagueId = selectedLeagueIdForForm || leagues[0].id;
    const leagueTeams = teams.filter(t => t.leagueId === defaultLeagueId);

    setCurrentMatch({
      leagueId: defaultLeagueId,
      teamAId: leagueTeams.length > 0 ? leagueTeams[0].id : '',
      teamBId: leagueTeams.length > 1 ? leagueTeams[1].id : '',
      dateTime: new Date().toISOString().substring(0, 16), // For datetime-local
      venue: '',
      overs: DEFAULT_OVERS,
    });
    setSelectedLeagueIdForForm(defaultLeagueId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMatch(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (currentMatch) {
      const { name, value } = e.target;
      if (name === "leagueId") {
        setSelectedLeagueIdForForm(value);
        // Reset teams if league changes
        const leagueTeams = teams.filter(t => t.leagueId === value);
        setCurrentMatch({ 
            ...currentMatch, 
            leagueId: value,
            teamAId: leagueTeams.length > 0 ? leagueTeams[0].id : '',
            teamBId: leagueTeams.length > 1 ? leagueTeams[1].id : '',
        });
      } else {
        setCurrentMatch({ ...currentMatch, [name]: name === 'overs' ? parseInt(value, 10) : value });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || !currentMatch.teamAId || !currentMatch.teamBId || currentMatch.teamAId === currentMatch.teamBId) {
        alert("Please select two different teams for the match.");
        return;
    }
    try {
      await addMatch(currentMatch);
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save match:", err);
    }
  };
  
  const getTeamName = (teamId: string): string => teams.find(t => t.id === teamId)?.name || 'N/A';
  const getLeagueName = (leagueId: string): string => leagues.find(l => l.id === leagueId)?.name || 'N/A';
  
  const teamsInSelectedLeague = currentMatch ? teams.filter(team => team.leagueId === currentMatch.leagueId) : [];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Matches</h1>
        <Button onClick={openCreateModal} leftIcon={ICONS.PLUS} disabled={leagues.length === 0}>Create Match</Button>
      </div>

      {loadingData && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading matches...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!loadingData && matches.length === 0 && (
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
            <div className="mt-4 space-x-2">
              <Button size="sm" variant="ghost" leftIcon={ICONS.EDIT}>Edit</Button>
              <Button size="sm" variant="danger" leftIcon={ICONS.DELETE}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {currentMatch && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Match" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700">League</label>
              <select id="leagueId" name="leagueId" value={currentMatch.leagueId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="teamAId" className="block text-sm font-medium text-gray-700">Team A</label>
              <select id="teamAId" name="teamAId" value={currentMatch.teamAId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white" disabled={teamsInSelectedLeague.length === 0}>
                <option value="">Select Team A</option>
                {teamsInSelectedLeague.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="teamBId" className="block text-sm font-medium text-gray-700">Team B</label>
              <select id="teamBId" name="teamBId" value={currentMatch.teamBId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white" disabled={teamsInSelectedLeague.length === 0}>
                <option value="">Select Team B</option>
                {teamsInSelectedLeague.filter(t => t.id !== currentMatch.teamAId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <Input label="Date & Time" name="dateTime" type="datetime-local" value={currentMatch.dateTime} onChange={handleChange} required />
            <Input label="Venue" name="venue" value={currentMatch.venue} onChange={handleChange} required />
            <Input label="Overs" name="overs" type="number" value={currentMatch.overs.toString()} onChange={handleChange} required min="1" />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" isLoading={loadingData}>Save Match</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MatchManagementPage;
