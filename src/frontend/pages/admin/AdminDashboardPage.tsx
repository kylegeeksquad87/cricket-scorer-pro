
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { NAV_LINKS, ICONS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome, {user?.username || 'Admin'}! Manage your cricket operations from here.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to={NAV_LINKS.ADMIN_LEAGUES}>
          <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
            <div className="flex items-center p-4">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3 mr-4">
                {React.cloneElement(ICONS.LEAGUES, { className: "h-6 w-6 text-white" })}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800">Manage Leagues</p>
                <p className="text-sm text-gray-500">Create, edit, and oversee leagues.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to={NAV_LINKS.ADMIN_TEAMS}>
          <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
            <div className="flex items-center p-4">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3 mr-4">
                {React.cloneElement(ICONS.TEAMS, { className: "h-6 w-6 text-white" })}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800">Manage Teams</p>
                <p className="text-sm text-gray-500">Organize teams and assign players.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to={NAV_LINKS.ADMIN_PLAYERS}>
          <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
            <div className="flex items-center p-4">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3 mr-4">
                 {React.cloneElement(ICONS.PLAYERS, { className: "h-6 w-6 text-white" })}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800">Manage Players</p>
                <p className="text-sm text-gray-500">Maintain player profiles and statistics.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to={NAV_LINKS.ADMIN_MATCHES}>
          <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
            <div className="flex items-center p-4">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3 mr-4">
                {React.cloneElement(ICONS.MATCHES, { className: "h-6 w-6 text-white" })}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800">Manage Matches</p>
                <p className="text-sm text-gray-500">Schedule and oversee match details.</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to={NAV_LINKS.SCORING_HOME}>
          <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
            <div className="flex items-center p-4">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3 mr-4">
                {React.cloneElement(ICONS.SCORING, { className: "h-6 w-6 text-white" })}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800">Live Scoring</p>
                <p className="text-sm text-gray-500">Access live match scoring interface.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to={NAV_LINKS.ADMIN_SETTINGS}>
          <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
            <div className="flex items-center p-4">
              <div className="flex-shrink-0 bg-gray-500 rounded-md p-3 mr-4">
                {React.cloneElement(ICONS.SETTINGS, { className: "h-6 w-6 text-white" })}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800">Admin Settings</p>
                <p className="text-sm text-gray-500">Configure application settings.</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
