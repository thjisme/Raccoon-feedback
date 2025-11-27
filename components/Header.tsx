
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.78 2.22a.75.75 0 00-1.06 0L12 8.94 5.28 2.22a.75.75 0 00-1.06 1.06L10.94 10 .22 16.72a.75.75 0 101.06 1.06L12 11.06l6.72 6.72a.75.75 0 101.06-1.06L13.06 10l6.72-6.72a.75.75 0 000-1.06zM21.25 21.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-18 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM12 4.25a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Writing Feedback Assistant
        </h1>
      </div>
    </header>
  );
};

export default Header;