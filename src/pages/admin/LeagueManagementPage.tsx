
import React, { useState, useEffect } from 'react';
import { League, LeagueFormData } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ICONS } from '../../constants';

const LeagueManagementPage: React.FC = () => {
  const { leagues, fetchLeagues, addLeague, loadingData, error } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLeague, setCurrentLeague] = useState<LeagueFormData | null>(null);
  // const [editingLeague, setEditingLeague] = useState<League | null>(null); // For editing

  useEffect(() => {
    fetchLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setCurrentLeague({ name: '', location: '', startDate: '', endDate: '' });
    setIsModalOpen(true);
  };

  // const openEditModal = (league: League) => {
  //   setEditingLeague(league);
  //   setCurrentLeague({ name: league.name, location: league.location, startDate: league.startDate, endDate: league.endDate });
  //   setIsModalOpen(true);
  // };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLeague(null);
    // setEditingLeague(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentLeague) {
      setCurrentLeague({ ...currentLeague, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLeague) return;
    try {
      // if (editingLeague) {
      //   await updateLeague(editingLeague.id, currentLeague);
      // } else {
      await addLeague(currentLeague);
      // }
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save league:", err);
      // Error will be shown by context or a local state here
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Leagues</h1>
        <Button onClick={openCreateModal} leftIcon={ICONS.PLUS}>Create League</Button>
      </div>

      {loadingData && <p className="flex items-center text-gray-600">{ICONS.SPINNER} Loading leagues...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!loadingData && leagues.length === 0 && (
        <Card><p className="text-gray-600 text-center py-4">No leagues found. Get started by creating one!</p></Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <Card key={league.id} title={league.name} actions={
            <div className="space-x-2">
              <Button size="sm" variant="ghost" leftIcon={ICONS.EDIT} /*onClick={() => openEditModal(league)}*/>Edit</Button>
              <Button size="sm" variant="danger" leftIcon={ICONS.DELETE} /*onClick={() => handleDelete(league.id)}*/>Delete</Button>
            </div>
          }>
            <p className="text-sm text-gray-600"><strong>Location:</strong> {league.location}</p>
            <p className="text-sm text-gray-600"><strong>Starts:</strong> {new Date(league.startDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600"><strong>Ends:</strong> {new Date(league.endDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600"><strong>Teams:</strong> {league.teams?.length || 0}</p>
          </Card>
        ))}
      </div>

      {currentLeague && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={ "Create New League" /*editingLeague ? "Edit League" : "Create New League"*/}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="League Name" name="name" value={currentLeague.name} onChange={handleChange} required />
            <Input label="Location" name="location" value={currentLeague.location} onChange={handleChange} required />
            <Input label="Start Date" name="startDate" type="date" value={currentLeague.startDate} onChange={handleChange} required />
            <Input label="End Date" name="endDate" type="date" value={currentLeague.endDate} onChange={handleChange} required />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" isLoading={loadingData}>Save League</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LeagueManagementPage;
