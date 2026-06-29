import React from 'react';
import { InformationCircleIcon } from './icons';

interface SystemMessageProps {
    text: string;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ text }) => (
  <div className="flex justify-center my-2" aria-live="polite">
    <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs text-center rounded-lg px-3 py-2 shadow-sm flex items-center gap-2 max-w-sm">
      <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
      <span>{text}</span>
    </div>
  </div>
);

export default SystemMessage;