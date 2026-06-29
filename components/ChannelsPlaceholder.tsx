import React from 'react';
import { SpeakerWaveIcon } from './icons';

const ChannelsPlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-kuik-dark-panel p-8">
      <div className="relative mb-6">
        <SpeakerWaveIcon className="w-32 h-32 text-gray-300 dark:text-gray-600" />
      </div>
      <h2 className="text-3xl font-light text-gray-700 dark:text-kuik-dark-text-primary">Welcome to Channels</h2>
      <p className="mt-4 text-gray-500 dark:text-kuik-dark-text-secondary max-w-md">
        Follow your favorite brands, celebrities, and news sources to get updates directly in KuikChat.
      </p>
      <p className="mt-2 text-sm text-gray-400 dark:text-kuik-dark-text-secondary">
        Find and follow channels from the list on the left.
      </p>
    </div>
  );
};

export default ChannelsPlaceholder;
