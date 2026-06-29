import React, { useState, useMemo } from 'react';
import { Chat } from '../types';
import { CloseIcon, SearchIcon, ForwardIcon } from './icons';

interface ForwardModalProps {
  chats: Chat[];
  onClose: () => void;
  onForward: (chatId: string) => void;
}

const ForwardModal: React.FC<ForwardModalProps> = ({ chats, onClose, onForward }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
        const name = chat.type === 'individual' ? chat.user.name : chat.name;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [chats, searchQuery]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-kuik-dark-panel rounded-lg shadow-2xl w-full max-w-md flex flex-col animate-fade-in max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-kuik-dark-text-primary flex items-center gap-2">
                <ForwardIcon className="w-6 h-6 text-kuik-accent" />
                Forward message to...
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-header">
                <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
            </button>
        </header>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="text-gray-400 dark:text-kuik-dark-text-secondary" />
                </div>
                <input
                    type="text"
                    placeholder="Search chats"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 pl-10 rounded-lg bg-gray-100 dark:bg-kuik-dark-header border-gray-200 dark:border-gray-600 text-gray-900 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                    autoFocus
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
            {filteredChats.map(chat => {
                 let name = "Unknown";
                 let avatar = "";
                 let subtext = "";

                 if (chat.type === 'individual') {
                     name = chat.user.name;
                     avatar = chat.user.avatar;
                     subtext = chat.user.username;
                 } else if (chat.type === 'group') {
                     name = chat.name;
                     avatar = chat.avatar;
                     subtext = `${chat.participants.length} participants`;
                 } else if (chat.type === 'channel') {
                     name = chat.name;
                     avatar = chat.avatar;
                 }

                return (
                    <div 
                        key={chat.id} 
                        onClick={() => onForward(chat.id)}
                        className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-kuik-dark-header rounded-lg transition-colors"
                    >
                        <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4" />
                        <div>
                            <p className="font-medium text-gray-800 dark:text-kuik-dark-text-primary">{name}</p>
                            <p className="text-sm text-gray-500 dark:text-kuik-dark-text-secondary">{subtext}</p>
                        </div>
                    </div>
                );
            })}
            {filteredChats.length === 0 && (
                <p className="text-center text-gray-500 p-4">No chats found.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;