
import React, { useState, useEffect } from 'react';
import { Team, TeamFormData, League } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS } from '../../constants';

const TeamManagementPage: React.FC = () => {
  const { teams, leagues, fetchTeams, fetchLeagues, addTeam, loadingData, error } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<TeamFormData | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');

  useEffect(() => {
    fetchLeagues();
    // Fetch all teams initially, or teams for a default/first league
    if (leagues.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(leagues[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagues]); // Depend on leagues to set initial selectedLeagueId

  useEffect(() => {
    if (selectedLeagueId) {
      fetchTeams(selectedLeagueId);
    } else {
      fetchTeams(); // Fetch all if no league selected (or handle as needed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeagueId]);


  const openCreateModal = () => {
    if (!selectedLeagueId && leagues.length > 0) {
        alert("Please select a league first."); // Or default to first league
        setSelectedLeagueId(leagues[0].id); // Set and then open modal
    }
    setCurrentTeam({ name: '', logoUrl: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTeam(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (currentTeam) {
      setCurrentTeam({ ...currentTeam, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !selectedLeagueId) {
        alert("League must be selected and team name provided.");
        return;
    }
    try {
      await addTeam({ ...currentTeam, leagueId: selectedLeagueId });
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save team:", err);
    }
  };
  
  const filteredTeams = selectedLeagueId ? teams.filter(team => team.leagueId === selectedLeagueId) : teams;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Teams</h1>
        <Button onClick={openCreateModal} leftIcon={ICONS.PLUS} disabled={!selectedLeagueId && leagues.length === 0}>Create Team</Button>
      </div>

      <div className="mb-4">
        <label htmlFor="leagueFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by League:</label>
        <select
          id="leagueFilter"
          name="leagueFilter"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
          value={selectedLeagueId}
          onChange={(e) => setSelectedLeagueId(e.target.value)}
          disabled={leagues.length === 0}
        >
          <option value="">{leagues.length > 0 ? "Select a League" : "No Leagues Available"}</option>
          {leagues.map((league: League) => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
      </div>

      {loadingData && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading teams...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!loadingData && filteredTeams.length === 0 && selectedLeagueId && (
        <Card><p className="text-gray-600 text-center py-4">No teams found for this league. Create one!</p></Card>
      )}
      {!loadingData && !selectedLeagueId && leagues.length > 0 && (
         <Card><p className="text-gray-600 text-center py-4">Please select a league to view teams.</p></Card>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} title={team.name} actions={
             <div className="space-x-2">
              <Button size="sm" variant="ghost" leftIcon={ICONS.EDIT}>Edit</Button>
              <Button size="sm" variant="danger" leftIcon={ICONS.DELETE}>Delete</Button>
            </div>
          }>
            <img src={team.logoUrl || `https://picsum.photos/seed/${team.id}/200/150`} alt={`${team.name} logo`} className="w-full h-32 object-cover mb-2 rounded" />
            <p className="text-sm text-gray-600"><strong>League:</strong> {leagues.find(l => l.id === team.leagueId)?.name}</p>
            <p className="text-sm text-gray-600"><strong>Players:</strong> {team.players?.length || 0}</p>
          </Card>
        ))}
      </div>

      {currentTeam && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Team">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Team Name" name="name" value={currentTeam.name} onChange={handleChange} required />
            <Input label="Logo URL (Optional)" name="logoUrl" value={currentTeam.logoUrl || ''} onChange={handleChange} placeholder="https://example.com/logo.png" />
            <div>
                <label htmlFor="league" className="block text-sm font-medium text-gray-700">League</label>
                <input 
                    type="text" 
                    id="league" 
                    name="league" 
                    value={leagues.find(l => l.id === selectedLeagueId)?.name || 'No league selected'} 
                    disabled 
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" isLoading={loadingData} disabled={!selectedLeagueId}>Save Team</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeamManagementPage;
