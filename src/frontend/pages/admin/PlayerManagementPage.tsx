
import React, { useState, useEffect } from 'react';
import { Player, PlayerFormData, Team } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS } from '../../constants';

const PlayerManagementPage: React.FC = () => {
  const { 
    players, teams, 
    fetchPlayers, fetchTeams, 
    addPlayer, updatePlayer, deletePlayer, 
    loadingData, error, clearError 
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlayerData, setCurrentPlayerData] = useState<PlayerFormData>({ firstName: '', lastName: '', teamIds: [], initialTeamId: '' });
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [selectedTeamIdForFilter, setSelectedTeamIdForFilter] = useState<string>('');

  useEffect(() => {
    fetchTeams(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTeamIdForFilter) {
        fetchPlayers(selectedTeamIdForFilter);
    } else {
        fetchPlayers(); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamIdForFilter]);

  const openCreateModal = () => {
    clearError();
    setEditingPlayer(null);
    setCurrentPlayerData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        profilePictureUrl: '', 
        teamIds: [], 
        initialTeamId: teams.length > 0 ? teams[0].id : '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    clearError();
    setEditingPlayer(player);
    setCurrentPlayerData({ 
        firstName: player.firstName, 
        lastName: player.lastName, 
        email: player.email || '', 
        profilePictureUrl: player.profilePictureUrl || '',
        teamIds: [...player.teamIds], // Use existing teamIds for edit
        initialTeamId: undefined // Not used in edit mode directly for this field
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPlayerData({ firstName: '', lastName: '', teamIds: [], initialTeamId: '' });
    setEditingPlayer(null);
    clearError();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPlayerData(prev => ({ ...prev, [e.target.name]: e.target.value } as PlayerFormData));
  };

  const handleTeamSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editingPlayer) { // Multi-select for editing: populates teamIds
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setCurrentPlayerData(prev => ({...prev, teamIds: selectedOptions }));
    } else { // Single select for creating: populates initialTeamId and also teamIds for immediate reflection
        setCurrentPlayerData(prev => ({...prev, initialTeamId: e.target.value, teamIds: e.target.value ? [e.target.value] : [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlayerData.firstName || !currentPlayerData.lastName) {
        alert("First and Last name are required.");
        return;
    }
    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, currentPlayerData);
      } else {
        // For creation, ensure `teamIds` is consistent if `initialTeamId` was set.
        // The DataContext `addPlayer` should use `initialTeamId`.
        const createPayload: PlayerFormData = {
            ...currentPlayerData,
            teamIds: currentPlayerData.initialTeamId ? [currentPlayerData.initialTeamId] : []
        };
        await addPlayer(createPayload);
      }
      handleCloseModal();
      fetchPlayers(selectedTeamIdForFilter || undefined); 
    } catch (err) {
      console.error("Failed to save player:", err);
      // Error is set in DataContext
    }
  };
  
  const handleDeleteConfirm = (player: Player) => {
    clearError();
    setPlayerToDelete(player);
  };

  const handleDelete = async () => {
    if (!playerToDelete) return;
    try {
      await deletePlayer(playerToDelete.id);
      setPlayerToDelete(null);
      fetchPlayers(selectedTeamIdForFilter || undefined); 
    } catch (err) {
      console.error("Failed to delete player:", err);
       // Error is set in DataContext
    }
  };

  const filteredPlayers = selectedTeamIdForFilter 
    ? players.filter(player => player.teamIds.includes(selectedTeamIdForFilter)) 
    : players;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Players</h1>
        <Button onClick={openCreateModal} leftIcon={ICONS.PLUS}>Create Player</Button>
      </div>

      <div className="mb-4">
        <label htmlFor="teamFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Team:</label>
        <select
          id="teamFilter"
          name="teamFilter"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
          value={selectedTeamIdForFilter}
          onChange={(e) => setSelectedTeamIdForFilter(e.target.value)}
          disabled={teams.length === 0 || loadingData}
        >
          <option value="">All Players</option>
          {teams.map((team: Team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      {loadingData && !isModalOpen && !playerToDelete && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading players...</p>}
      
      {!loadingData && filteredPlayers.length === 0 && (
        <Card><p className="text-gray-600 text-center py-4">No players found. Create one or adjust filters.</p></Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="text-center">
            <img 
              src={player.profilePictureUrl || `https://picsum.photos/seed/${player.id}/150/150`} 
              alt={`${player.firstName} ${player.lastName}`} 
              className="w-24 h-24 rounded-full mx-auto mb-3 object-cover" 
            />
            <h3 className="text-lg font-semibold text-gray-800">{player.firstName} {player.lastName}</h3>
            <p className="text-sm text-gray-500">{player.email}</p>
            <p className="text-xs text-gray-500 mt-1">Teams: {player.teamIds.map(tid => teams.find(t=>t.id === tid)?.name || 'N/A').join(', ') || 'No teams'}</p>
            <div className="mt-4 space-x-2">
              <Button size="sm" variant="ghost" leftIcon={ICONS.EDIT} onClick={() => openEditModal(player)}>Edit</Button>
              <Button size="sm" variant="danger" leftIcon={ICONS.DELETE} onClick={() => handleDeleteConfirm(player)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {isModalOpen && currentPlayerData && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPlayer ? "Edit Player" : "Create New Player"} size="md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded flex items-center"><span className="mr-2">{ICONS.WARNING}</span> {error}</p>}
            <Input label="First Name" name="firstName" value={currentPlayerData.firstName || ''} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={currentPlayerData.lastName || ''} onChange={handleChange} required />
            <Input label="Email (Optional)" name="email" type="email" value={currentPlayerData.email || ''} onChange={handleChange} />
            <Input label="Profile Picture URL (Optional)" name="profilePictureUrl" value={currentPlayerData.profilePictureUrl || ''} onChange={handleChange} />
            <div>
              <label htmlFor="teamAssignment" className="block text-sm font-medium text-gray-700 mb-1">
                {editingPlayer ? "Assign to Teams" : "Assign to Initial Team (Optional)"}
              </label>
              <select
                id="teamAssignment"
                name={editingPlayer ? "teamIds" : "initialTeamId"}
                multiple={!!editingPlayer} 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
                value={editingPlayer ? currentPlayerData.teamIds : (currentPlayerData.initialTeamId || '')}
                onChange={handleTeamSelectChange}
                size={editingPlayer ? (teams.length > 5 ? 5 : Math.max(teams.length,1)) : 1}
              >
                {!editingPlayer && <option value="">No specific team</option>}
                {teams.map((team: Team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              {editingPlayer && <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple teams.</p>}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" isLoading={loadingData}>Save Player</Button>
            </div>
          </form>
        </Modal>
      )}

      {playerToDelete && (
        <Modal isOpen={true} onClose={() => { setPlayerToDelete(null); clearError(); }} title="Confirm Delete">
            <p>Are you sure you want to delete the player "<strong>{playerToDelete.firstName} {playerToDelete.lastName}</strong>"? This action cannot be undone.</p>
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded mt-2 flex items-center"><span className="mr-2">{ICONS.WARNING}</span> {error}</p>}
            <div className="flex justify-end space-x-3 pt-4 mt-4">
                <Button variant="secondary" onClick={() => {setPlayerToDelete(null); clearError(); }}>Cancel</Button>
                <Button variant="danger" onClick={handleDelete} isLoading={loadingData}>Delete Player</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default PlayerManagementPage;
