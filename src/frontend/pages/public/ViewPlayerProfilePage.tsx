
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext'; // Import useData
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ICONS } from '../../constants';

interface ViewPlayerProfilePageProps {
  editMode?: boolean; 
}

const ViewPlayerProfilePage: React.FC<ViewPlayerProfilePageProps> = ({ editMode = false }) => {
  const { playerId: routePlayerId } = useParams<{ playerId?: string }>();
  const { user, loadingAuth, error: authError, clearAuthError } = useAuth();
  const { 
    players: allPlayersFromContext, 
    teams: allTeamsFromContext, 
    fetchPlayers: fetchPlayersContext, // To ensure players are loaded
    // updatePlayer: updatePlayerApi, // Assuming this will be added to DataContext
    loadingPlayers: contextLoadingPlayers, 
    error: dataError,
    clearError: clearDataError
  } = useData();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null);
  const [playerTeams, setPlayerTeams] = useState<Team[]>([]);
  const [isEditing, setIsEditing] = useState(editMode);
  const [formData, setFormData] = useState<Partial<Player>>({});
  
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const playerIdToFetch = editMode ? user?.id : routePlayerId;

  const loadProfile = useCallback(async () => {
    if (!playerIdToFetch && !loadingAuth) {
      setPageError(editMode ? "User not logged in or ID unavailable." : "Player ID missing.");
      setPageLoading(false);
      if (editMode) navigate("/login");
      return;
    }
    if ((loadingAuth && editMode) || contextLoadingPlayers) {
        // Wait for auth or initial player load from context
        // setPageLoading(true); // Ensure loading spinner shows if context is still loading
        return;
    }

    setPageLoading(true);
    setPageError(null);
    clearAuthError();
    clearDataError();
    
    // Ensure players are loaded in context if not already
    if (allPlayersFromContext.length === 0) {
        await fetchPlayersContext(); // This might re-trigger the effect, be careful
    }

    let playerData: Player | undefined;
    if (editMode && user) { // Fetching own profile
        playerData = allPlayersFromContext.find(p => p.id === user.id);
        if (!playerData) { // Fallback if user ID isn't in players list (e.g. admin not a player)
             playerData = { // Construct a temporary Player-like object from User
                id: user.id,
                firstName: user.username.split(' ')[0] || user.username,
                lastName: user.username.split(' ')[1] || '',
                email: user.email,
                profilePictureUrl: user.profilePictureUrl,
                teamIds: [] // Admin/Scorer might not have teamIds in player sense
            };
        }
    } else if (routePlayerId) { // Fetching specific player by ID
        playerData = allPlayersFromContext.find(p => p.id === routePlayerId);
    }

    if (!playerData) {
      setPageError("Player not found.");
      setPageLoading(false);
      return;
    }
    setPlayer(playerData);
    setFormData(playerData);

    if (playerData.teamIds && playerData.teamIds.length > 0) {
      const teamsData = playerData.teamIds
        .map(tid => allTeamsFromContext.find(t => t.id === tid))
        .filter(t => t !== undefined) as Team[];
      setPlayerTeams(teamsData);
    } else {
      setPlayerTeams([]);
    }
    setPageLoading(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      playerIdToFetch, loadingAuth, editMode, user, routePlayerId, navigate, 
      allPlayersFromContext, allTeamsFromContext, fetchPlayersContext, 
      contextLoadingPlayers, clearAuthError, clearDataError
  ]);
  
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

 useEffect(() => {
    if (authError) setPageError(authError);
    if (dataError) setPageError(dataError);
 }, [authError, dataError]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !isEditing || !playerIdToFetch) return;
    setPageLoading(true);
    try {
      // Assuming updatePlayerApi will be available in DataContext
      // await updatePlayerApi(playerIdToFetch, formData); 
      console.log("Mock update player via API:", playerIdToFetch, formData);
      // For now, simulate success:
      setPlayer(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      alert("Profile updated successfully (mock).");
    } catch (err: any) {
      setPageError(err.message || "Failed to update profile.");
    } finally {
      setPageLoading(false);
    }
  };
  
  const isLoading = pageLoading || (editMode && loadingAuth) || contextLoadingPlayers;

  if (isLoading) return <div className="flex justify-center items-center h-screen">{ICONS.SPINNER} Loading profile...</div>;
  if (pageError) return <div className="text-red-500 text-center p-4">{ICONS.WARNING} Error: {pageError} <Button onClick={()=>{setPageError(null); loadProfile();}} size="sm">Retry</Button></div>;
  if (!player) return <div className="text-center p-4">Player profile not available.</div>;

  const canEditThisProfile = editMode && user?.id === player.id;

  return (
    <div className="max-w-2xl mx-auto">
      <Card title={isEditing ? "Edit Your Profile" : `${player.firstName} ${player.lastName}'s Profile`}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-6">
            <img 
              src={isEditing ? formData.profilePictureUrl || player.profilePictureUrl : player.profilePictureUrl || `https://ui-avatars.com/api/?name=${player.firstName}+${player.lastName}&size=160`} 
              alt={`${player.firstName} ${player.lastName}`} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md bg-gray-200"
            />
            {isEditing && (
                <Input
                    containerClassName="w-full"
                    label="Profile Picture URL"
                    name="profilePictureUrl"
                    value={formData.profilePictureUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.png"
                />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                label="First Name" 
                name="firstName" 
                value={isEditing ? formData.firstName || '' : player.firstName} 
                onChange={handleInputChange} 
                disabled={!isEditing} 
                required={isEditing} 
            />
            <Input 
                label="Last Name" 
                name="lastName" 
                value={isEditing ? formData.lastName || '' : player.lastName} 
                onChange={handleInputChange} 
                disabled={!isEditing} 
                required={isEditing}
            />
            <Input 
                label="Email" 
                name="email" 
                type="email" 
                value={isEditing ? formData.email || '' : player.email || 'N/A'} 
                onChange={handleInputChange} 
                disabled={!isEditing}
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Teams</h3>
            {playerTeams.length > 0 ? (
              <ul className="list-disc list-inside">
                {playerTeams.map(team => <li key={team.id} className="text-gray-600">{team.name}</li>)}
              </ul>
            ) : (
              <p className="text-gray-500">Not currently associated with any teams.</p>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Player Statistics</h3>
            <p className="text-gray-500">Player statistics will be displayed here (e.g., matches played, runs scored, wickets taken).</p>
          </div>
          
          {canEditThisProfile && (
            <div className="mt-8 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button type="button" variant="secondary" onClick={() => { setIsEditing(false); setFormData(player); }}>Cancel</Button>
                  <Button type="submit" isLoading={pageLoading}>Save Changes</Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)} leftIcon={ICONS.EDIT}>Edit Profile</Button>
              )}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ViewPlayerProfilePage;
