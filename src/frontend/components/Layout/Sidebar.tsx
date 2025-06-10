
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS, ICONS } from '../../constants';

interface SidebarNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-150 ease-in-out group ${
        isActive ? 'bg-blue-100 text-blue-600 font-semibold' : 'hover:text-gray-900'
      }`
    }
  >
    <span className="mr-3 text-lg w-6 text-center">{icon}</span>
    {label}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white shadow-md p-4 space-y-2 border-r border-gray-200 h-full">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-2 pb-1">Management</h2>
      <SidebarNavItem to={NAV_LINKS.ADMIN_DASHBOARD} icon={ICONS.DASHBOARD} label="Dashboard" />
      <SidebarNavItem to={NAV_LINKS.ADMIN_LEAGUES} icon={ICONS.LEAGUES} label="Leagues" />
      <SidebarNavItem to={NAV_LINKS.ADMIN_TEAMS} icon={ICONS.TEAMS} label="Teams" />
      <SidebarNavItem to={NAV_LINKS.ADMIN_PLAYERS} icon={ICONS.PLAYERS} label="Players" />
      <SidebarNavItem to={NAV_LINKS.ADMIN_MATCHES} icon={ICONS.MATCHES} label="Matches" />
      <SidebarNavItem to={NAV_LINKS.ADMIN_SETTINGS} icon={ICONS.SETTINGS} label="Admin Settings" />
      
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-4 pb-1">Scoring</h2>
      <SidebarNavItem to={NAV_LINKS.SCORING_HOME} icon={ICONS.SCORING} label="Score Matches" />

      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-4 pb-1">Public View</h2>
      <SidebarNavItem to={NAV_LINKS.STANDINGS} icon={ICONS.STATS} label="Standings" />
    </aside>
  );
};
