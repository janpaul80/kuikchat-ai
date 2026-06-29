import React from 'react';
import { LockClosedIcon } from './icons';

const EncryptionNotice: React.FC = () => (
  <div className="flex justify-center my-2" aria-live="polite">
    <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-xs text-center rounded-lg px-3 py-2 shadow-sm flex items-center gap-2 max-w-sm">
      <LockClosedIcon className="w-4 h-4 flex-shrink-0" />
      <span>
        Messages are end-to-end encrypted. No one outside of this chat, not even KuikChat, can read or listen to them.
      </span>
    </div>
  </div>
);

export default EncryptionNotice;
