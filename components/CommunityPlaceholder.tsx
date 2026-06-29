
import React from 'react';
import { CommunityIcon } from './icons';

const CommunityPlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-kuik-dark-panel p-8">
      <div className="relative mb-6">
        <CommunityIcon className="w-32 h-32 text-gray-300 dark:text-gray-600" />
      </div>
      <h2 className="text-3xl font-light text-gray-700 dark:text-kuik-dark-text-primary">Welcome to Communities</h2>
      <p className="mt-4 text-gray-500 dark:text-kuik-dark-text-secondary max-w-md">
        Organize your group chats and stay connected in topic-based channels.
      </p>
      <p className="mt-2 text-sm text-gray-400 dark:text-kuik-dark-text-secondary">
        Explore and join new communities on the left to get started.
      </p>
    </div>
  );
};

export default CommunityPlaceholder;