
import React, { useState, useEffect } from 'react';
import { League, LeagueFormData } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS } from '../../constants';

const LeagueManagementPage: React.FC = () => {
  const { leagues, fetchLeagues, addLeague, updateLeague, deleteLeague, loadingData, error, clearError } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLeagueData, setCurrentLeagueData] = useState<LeagueFormData | null>(null);
  const [editingLeague, setEditingLeague] = useState<League | null>(null); 
  const [leagueToDelete, setLeagueToDelete] = useState<League | null>(null);

  useEffect(() => {
    fetchLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    clearError();
    setEditingLeague(null);
    setCurrentLeagueData({ name: '', location: '', startDate: '', endDate: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (league: League) => {
    clearError();
    setEditingLeague(league);
    setCurrentLeagueData({ 
        name: league.name, 
        location: league.location, 
        startDate: league.startDate.split('T')[0], // Format for date input
        endDate: league.endDate.split('T')[0]     // Format for date input
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLeagueData(null);
    setEditingLeague(null);
    clearError();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentLeagueData) {
      setCurrentLeagueData({ ...currentLeagueData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLeagueData?.name || !currentLeagueData.startDate || !currentLeagueData.endDate) {
         alert("League Name, Start Date and End Date are required."); // Use alert for client-side validation
        return;
    }
    // Ensure dates are in ISO format if only date part is captured
    // The backend expects full ISO strings, so new Date().toISOString() handles this.
    const payload = {
      ...currentLeagueData,
      startDate: new Date(currentLeagueData.startDate).toISOString(),
      endDate: new Date(currentLeagueData.endDate).toISOString()
    };

    try {
      if (editingLeague) {
        await updateLeague(editingLeague.id, payload);
      } else {
        await addLeague(payload);
      }
      handleCloseModal();
      fetchLeagues(); // Re-fetch to update the list
    } catch (err) {
      console.error("Failed to save league:", err);
      // Error is set in DataContext and will be displayed by the modal if still open
    }
  };
  
  const handleDeleteConfirm = (league: League) => {
    clearError();
    setLeagueToDelete(league);
  };

  const handleDelete = async () => {
    if (!leagueToDelete) return;
    try {
      await deleteLeague(leagueToDelete.id);
      setLeagueToDelete(null); 
      fetchLeagues(); // Re-fetch
    } catch (err) {
      console.error("Failed to delete league:", err);
      // Error is set in DataContext and will be displayed by the modal
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Leagues</h1>
        <Button onClick={openCreateModal} leftIcon={ICONS.PLUS}>Create League</Button>
      </div>

      {loadingData && !isModalOpen && !leagueToDelete && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading leagues...</p>}
      
      {!loadingData && leagues.length === 0 && !isModalOpen && !leagueToDelete && (
        <Card><p className="text-gray-600 text-center py-4">No leagues found. Get started by creating one!</p></Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <Card key={league.id} title={league.name} actions={
            <div className="space-x-2">
              <Button size="sm" variant="ghost" leftIcon={ICONS.EDIT} onClick={() => openEditModal(league)}>Edit</Button>
              <Button size="sm" variant="danger" leftIcon={ICONS.DELETE} onClick={() => handleDeleteConfirm(league)}>Delete</Button>
            </div>
          }>
            <p className="text-sm text-gray-600"><strong>Location:</strong> {league.location}</p>
            <p className="text-sm text-gray-600"><strong>Starts:</strong> {new Date(league.startDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600"><strong>Ends:</strong> {new Date(league.endDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600"><strong>Teams:</strong> {league.teams?.length || 0}</p>
          </Card>
        ))}
      </div>

      {isModalOpen && currentLeagueData && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLeague ? "Edit League" : "Create New League"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded flex items-center"><span className="mr-2">{ICONS.WARNING}</span> {error}</p>}
            <Input label="League Name" name="name" value={currentLeagueData.name} onChange={handleChange} required />
            <Input label="Location" name="location" value={currentLeagueData.location} onChange={handleChange} required />
            <Input label="Start Date" name="startDate" type="date" value={currentLeagueData.startDate} onChange={handleChange} required />
            <Input label="End Date" name="endDate" type="date" value={currentLeagueData.endDate} onChange={handleChange} required />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" isLoading={loadingData}>Save League</Button>
            </div>
          </form>
        </Modal>
      )}

      {leagueToDelete && (
        <Modal isOpen={true} onClose={() => { setLeagueToDelete(null); clearError(); }} title="Confirm Delete">
            <p>Are you sure you want to delete the league "<strong>{leagueToDelete.name}</strong>"? This action cannot be undone and will also delete associated teams and matches.</p>
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded mt-2 flex items-center"><span className="mr-2">{ICONS.WARNING}</span> {error}</p>}
            <div className="flex justify-end space-x-3 pt-4 mt-4">
                <Button variant="secondary" onClick={() => { setLeagueToDelete(null); clearError(); }}>Cancel</Button>
                <Button variant="danger" onClick={handleDelete} isLoading={loadingData}>Delete League</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default LeagueManagementPage;
