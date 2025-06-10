
import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS, ICONS } from '../constants';
import { Button } from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <div className="text-blue-500 mb-8">
        {React.cloneElement(ICONS.WARNING, { className: "text-8xl" })}
      </div>
      <h1 className="text-5xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-gray-600 mb-8">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link to={NAV_LINKS.HOME}>
        <Button variant="primary" size="lg" leftIcon={ICONS.HOME}>
          Go to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
