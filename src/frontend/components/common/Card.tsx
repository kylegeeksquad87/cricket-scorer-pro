
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  actions?: React.ReactNode; // For buttons or other actions in the header
}

export const Card: React.FC<CardProps> = ({ title, children, className, titleClassName, bodyClassName, actions }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className || ''}`}>
      {title && (
        <div className={`px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center ${titleClassName || ''}`}>
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName || ''}`}>
        {children}
      </div>
    </div>
  );
};
