import React from 'react';
import { ChevronLeftIcon, UsersIcon, UserPlusIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface NewChatViewProps {
  onClose: () => void;
  onNewGroup: () => void;
  onNewContact: () => void;
}

const NewChatView: React.FC<NewChatViewProps> = ({ onClose, onNewGroup, onNewContact }) => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 bg-white dark:bg-kuik-dark-bg z-40 flex flex-col">
      <header className="flex-shrink-0 bg-kuik-light-green text-white p-4 flex items-center shadow-md">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
          <ChevronLeftIcon className="w-6 h-6 transform -translate-x-0.5" />
        </button>
        <h2 className="text-xl font-semibold ml-4">{t('newChat.title')}</h2>
      </header>
      <div className="flex-1 overflow-y-auto">
        <ul className="py-2">
          <li>
            <button onClick={onNewGroup} className="w-full flex items-center px-6 py-4 text-left hover:bg-gray-100 dark:hover:bg-kuik-dark-header transition-colors">
              <div className="p-3 bg-kuik-accent rounded-full mr-4">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-800 dark:text-kuik-dark-text-primary">{t('newChat.newGroup')}</span>
            </button>
          </li>
          <li>
            <button onClick={onNewContact} className="w-full flex items-center px-6 py-4 text-left hover:bg-gray-100 dark:hover:bg-kuik-dark-header transition-colors">
              <div className="p-3 bg-kuik-accent rounded-full mr-4">
                <UserPlusIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-800 dark:text-kuik-dark-text-primary">{t('newChat.newContact')}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NewChatView;
