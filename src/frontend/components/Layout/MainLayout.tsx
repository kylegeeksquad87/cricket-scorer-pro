
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Sidebar } from './Sidebar'; // Corrected to named import
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAdminSection = location.pathname.startsWith('/admin') && user?.role === UserRole.ADMIN;
  // More fine-grained sidebar display logic could be added here, e.g. for scorers on scoring pages.

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {isAdminSection && <Sidebar />}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 ${isAdminSection ? '' : 'w-full'}`}>
          {children}
        </main>
      </div>
      <footer className="bg-gray-800 text-white text-center p-4 text-sm">
        © {new Date().getFullYear()} Cricket Scorer Pro. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
