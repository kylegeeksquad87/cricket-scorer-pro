
import React, { useState, useEffect } from 'react';
import { Team, TeamFormData, League, Player } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS } from '../../constants';

const TeamManagementPage: React.FC = () => {
  const { 
    teams, leagues, players: allPlayers, 
    fetchTeams, fetchLeagues, fetchPlayers: fetchAllPlayers, // Renamed to avoid conflict
    addTeam, updateTeam, deleteTeam, 
    loadingData, error, clearError 
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeamData, setCurrentTeamData] = useState<Partial<TeamFormData & { leagueId: string }>>({});
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');

  useEffect(() => {
    fetchLeagues();
    fetchAllPlayers(); // Fetch all players for captain dropdown
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leagues.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(leagues[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagues]); 

  useEffect(() => {
    if (selectedLeagueId) {
      fetchTeams(selectedLeagueId);
    } else if (leagues.length > 0) { 
      fetchTeams(leagues[0].id);
    }
    // If no leagues, teams will remain empty or as per initial state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeagueId, leagues]);


  const openCreateModal = () => {
    if (!selectedLeagueId && leagues.length > 0) {
        // Default to first league if none selected yet but leagues are available
        setSelectedLeagueId(leagues[0].id); 
    }
    if (!selectedLeagueId && leagues.length === 0) {
        alert("Please create a league first.");
        return;
    }
    clearError();
    setEditingTeam(null);
    setCurrentTeamData({ name: '', logoUrl: '', leagueId: selectedLeagueId || (leagues.length > 0 ? leagues[0].id : ''), captainId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    clearError();
    setEditingTeam(team);
    setCurrentTeamData({ 
        name: team.name, 
        logoUrl: team.logoUrl || '', 
        leagueId: team.leagueId, 
        captainId: team.captainId || '' 
    });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTeamData({});
    setEditingTeam(null);
    clearError();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCurrentTeamData({ ...currentTeamData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeamData.name || !currentTeamData.leagueId) {
        alert("League and team name must be provided."); 
        return;
    }
    try {
      const payload = {
        name: currentTeamData.name!,
        leagueId: currentTeamData.leagueId!,
        captainId: currentTeamData.captainId || undefined, 
        logoUrl: currentTeamData.logoUrl || undefined,
      };

      if (editingTeam) {
        await updateTeam(editingTeam.id, payload);
      } else {
        await addTeam(payload);
      }
      handleCloseModal();
      fetchTeams(selectedLeagueId || leagues[0]?.id); 
    } catch (err) {
      console.error("Failed to save team:", err);
      // Error is set in DataContext
    }
  };
  
  const handleDeleteConfirm = (team: Team) => {
    clearError();
    setTeamToDelete(team);
  };

  const handleDelete = async () => {
    if (!teamToDelete) return;
    try {
      await deleteTeam(teamToDelete.id);
      setTeamToDelete(null); 
      fetchTeams(selectedLeagueId || leagues[0]?.id); 
    } catch (err) {
      console.error("Failed to delete team:", err);
      // Error is set in DataContext
    }
  };
  
  const filteredTeams = selectedLeagueId ? teams.filter(team => team.leagueId === selectedLeagueId) : [];
  const availableCaptains = allPlayers; 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Teams</h1>
        <Button onClick={openCreateModal} leftIcon={ICONS.PLUS} disabled={leagues.length === 0}>Create Team</Button>
      </div>

      <div className="mb-4">
        <label htmlFor="leagueFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by League:</label>
        <select
          id="leagueFilter"
          name="leagueFilter"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
          value={selectedLeagueId}
          onChange={(e) => setSelectedLeagueId(e.target.value)}
          disabled={leagues.length === 0 || loadingData}
        >
          <option value="">{leagues.length > 0 ? "Select a League" : "Loading Leagues..."}</option>
          {leagues.map((league: League) => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
      </div>

      {loadingData && !isModalOpen && !teamToDelete && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading teams...</p>}
      
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
              <Button size="sm" variant="ghost" leftIcon={ICONS.EDIT} onClick={() => openEditModal(team)}>Edit</Button>
              <Button size="sm" variant="danger" leftIcon={ICONS.DELETE} onClick={() => handleDeleteConfirm(team)}>Delete</Button>
            </div>
          }>
            <img src={team.logoUrl || `https://picsum.photos/seed/${team.id}/200/150`} alt={`${team.name} logo`} className="w-full h-32 object-cover mb-2 rounded" />
            <p className="text-sm text-gray-600"><strong>League:</strong> {leagues.find(l => l.id === team.leagueId)?.name}</p>
            <p className="text-sm text-gray-600"><strong>Captain:</strong> {allPlayers.find(p => p.id === team.captainId)?.firstName || 'N/A'}</p>
            <p className="text-sm text-gray-600"><strong>Players:</strong> { (team.players?.length || (team as any).playerIds?.length) || 0}</p>
          </Card>
        ))}
      </div>

      {isModalOpen && currentTeamData && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTeam ? "Edit Team" : "Create New Team"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded flex items-center"><span className="mr-2">{ICONS.WARNING}</span> {error}</p>}
            <Input label="Team Name" name="name" value={currentTeamData.name || ''} onChange={handleChange} required />
            <Input label="Logo URL (Optional)" name="logoUrl" value={currentTeamData.logoUrl || ''} onChange={handleChange} placeholder="https://example.com/logo.png" />
            <div>
                <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700">League</label>
                <select 
                    id="leagueId" 
                    name="leagueId" 
                    value={currentTeamData.leagueId || selectedLeagueId} 
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"
                    disabled={!!editingTeam || leagues.length === 0} 
                >
                     {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="captainId" className="block text-sm font-medium text-gray-700">Captain (Optional)</label>
                <select 
                    id="captainId" 
                    name="captainId" 
                    value={currentTeamData.captainId || ''} 
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"
                >
                    <option value="">Select Captain</option>
                    {availableCaptains.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" isLoading={loadingData} disabled={!currentTeamData.leagueId}>Save Team</Button>
            </div>
          </form>
        </Modal>
      )}

      {teamToDelete && (
        <Modal isOpen={true} onClose={() => { setTeamToDelete(null); clearError();}} title="Confirm Delete">
            <p>Are you sure you want to delete the team "<strong>{teamToDelete.name}</strong>"? This action cannot be undone and will remove its players associations and related matches.</p>
             {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded mt-2 flex items-center"><span className="mr-2">{ICONS.WARNING}</span> {error}</p>}
            <div className="flex justify-end space-x-3 pt-4 mt-4">
                <Button variant="secondary" onClick={() => {setTeamToDelete(null); clearError();}}>Cancel</Button>
                <Button variant="danger" onClick={handleDelete} isLoading={loadingData}>Delete Team</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default TeamManagementPage;
