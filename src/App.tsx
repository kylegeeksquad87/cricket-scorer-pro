
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import LeagueManagementPage from './pages/admin/LeagueManagementPage';
import TeamManagementPage from './pages/admin/TeamManagementPage';
import PlayerManagementPage from './pages/admin/PlayerManagementPage';
import MatchManagementPage from './pages/admin/MatchManagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import ScoreMatchPage from './pages/scoring/ScoreMatchPage';
import MatchesToScorePage from './pages/scoring/MatchesToScorePage';
import ViewStandingsPage from './pages/public/ViewStandingsPage';
import ViewScorecardPage from './pages/public/ViewScorecardPage';
import ViewPlayerProfilePage from './pages/public/ViewPlayerProfilePage';
import NotFoundPage from './pages/NotFoundPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/standings" element={<ViewStandingsPage />} />
        <Route path="/matches/:matchId/scorecard" element={<ViewScorecardPage />} />
        <Route path="/players/:playerId" element={<ViewPlayerProfilePage />} />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/leagues" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><LeagueManagementPage /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/teams" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><TeamManagementPage /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/players" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><PlayerManagementPage /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/matches" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><MatchManagementPage /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/settings" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminSettingsPage /></ProtectedRoute>} 
        />

        {/* Scorer Routes */}
        <Route 
          path="/scoring" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SCORER]}><MatchesToScorePage /></ProtectedRoute>} 
        />
        <Route 
          path="/scoring/:matchId" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SCORER]}><ScoreMatchPage /></ProtectedRoute>} 
        />
        
        {/* Player Routes (Optional - can expand) */}
        <Route 
          path="/profile" 
          element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SCORER, UserRole.PLAYER]}><ViewPlayerProfilePage editMode={true} /></ProtectedRoute>} 
        />

        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
