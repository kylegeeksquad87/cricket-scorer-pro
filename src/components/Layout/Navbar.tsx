
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { APP_NAME, NAV_LINKS, ICONS } from '../../constants';
import Button from '../common/Button';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
  >
    <span className="mr-2">{icon}</span>
    {label}
  </Link>
);

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(NAV_LINKS.LOGIN);
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={NAV_LINKS.HOME} className="flex-shrink-0 text-white font-bold text-xl">
              {APP_NAME}
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavItem to={NAV_LINKS.HOME} icon={ICONS.HOME} label="Home" />
                <NavItem to={NAV_LINKS.STANDINGS} icon={ICONS.STATS} label="Standings" />
                {user && (user.role === UserRole.ADMIN || user.role === UserRole.SCORER) && (
                  <NavItem to={NAV_LINKS.SCORING_HOME} icon={ICONS.SCORING} label="Score Matches" />
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <>
                  {user.role === UserRole.ADMIN && (
                     <NavItem to={NAV_LINKS.ADMIN_DASHBOARD} icon={ICONS.DASHBOARD} label="Admin" />
                  )}
                  <NavItem to={NAV_LINKS.PLAYER_PROFILE} icon={ICONS.PROFILE} label="Profile" />
                  <Button onClick={handleLogout} variant="secondary" size="sm" leftIcon={ICONS.LOGOUT} className="ml-3">
                    Logout
                  </Button>
                </>
              ) : (
                <NavItem to={NAV_LINKS.LOGIN} icon={ICONS.LOGIN} label="Login" />
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button - Basic placeholder */}
            <button type="button" className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
              <span className="sr-only">Open main menu</span>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu, show/hide based on menu state (not implemented here for brevity) */}
      {/* <div className="md:hidden"> ... </div> */}
    </nav>
  );
};

export default Navbar;
