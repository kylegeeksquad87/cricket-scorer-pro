
import React, { useState, useEffect } from 'react';
import { Player, PlayerFormData, Team } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS } from '../../constants';

const PlayerManagementPage: React.FC = () => {
  const { players, teams, fetchPlayers, fetchTeams, addPlayer, loadingData, error } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerFormData | null>(null);
  const [selectedTeamIdForFilter, setSelectedTeamIdForFilter] = useState<string>('');

  useEffect(() => {
    fetchTeams(); // Fetch all teams for the dropdown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTeamIdForFilter) {
        fetchPlayers(selectedTeamIdForFilter);
    } else {
        fetchPlayers(); // Fetch all players if no team selected
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamIdForFilter]);

  const openCreateModal = () => {
    setCurrentPlayer({ firstName: '', lastName: '', email: '', profilePictureUrl: '', teamId: teams.length > 0 ? teams[0].id : ''});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPlayer(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (currentPlayer) {
      setCurrentPlayer({ ...currentPlayer, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlayer) return;
    try {
      await addPlayer(currentPlayer);
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save player:", err);
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
        >
          <option value="">All Players</option>
          {teams.map((team: Team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      {loadingData && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading players...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

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
            <p className="text-xs text-gray-500 mt-1">Teams: {player.teamIds.map(tid => teams.find(t=>t.id === tid)?.name || 'N/A').join(', ')}</p>
            <div className="mt-4 space-x-2">
              <Button size="sm" variant="ghost" leftIcon={ICONS.EDIT}>Edit</Button>
              <Button size="sm" variant="danger" leftIcon={ICONS.DELETE}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {currentPlayer && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Player">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="First Name" name="firstName" value={currentPlayer.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={currentPlayer.lastName} onChange={handleChange} required />
            <Input label="Email (Optional)" name="email" type="email" value={currentPlayer.email || ''} onChange={handleChange} />
            <Input label="Profile Picture URL (Optional)" name="profilePictureUrl" value={currentPlayer.profilePictureUrl || ''} onChange={handleChange} />
            <div>
              <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">Assign to Team (Optional)</label>
              <select
                id="teamId"
                name="teamId"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
                value={currentPlayer.teamId || ''}
                onChange={handleChange}
              >
                <option value="">No specific team</option>
                {teams.map((team: Team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" isLoading={loadingData}>Save Player</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PlayerManagementPage;
