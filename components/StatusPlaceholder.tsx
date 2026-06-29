import React from 'react';
import { StatusIcon } from './icons';

const StatusPlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-kuik-dark-panel p-8">
      <div className="relative mb-6">
        <StatusIcon className="w-32 h-32 text-gray-300 dark:text-gray-600" />
        <div className="absolute inset-0 flex items-center justify-center">
            <StatusIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      <h2 className="text-3xl font-light text-gray-700 dark:text-kuik-dark-text-primary">KuikChat Status</h2>
      <p className="mt-4 text-gray-500 dark:text-kuik-dark-text-secondary max-w-md">
        Share photos, videos, text, and GIFs that disappear after 24 hours.
      </p>
      <p className="mt-2 text-sm text-gray-400 dark:text-kuik-dark-text-secondary">
        Select a contact's status on the left to view their updates.
      </p>
    </div>
  );
};

export default StatusPlaceholder;
