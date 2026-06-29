
import React, { useState } from 'react';
import { Chat } from '../types';
import ContactItem from './ContactItem';
import { SearchIcon, UserPlusIcon, EyeIcon, ChevronLeftIcon, EyeSlashIcon, ReplyIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import ContextMenu from './ContextMenu';

interface ContactListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  hasHiddenChats: boolean;
  isHiddenChatsLocked: boolean;
  onShowHiddenChatsPrompt: () => void;
  onToggleHideChat: (chatId: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ chats, activeChatId, onSelectChat, onNewChat, hasHiddenChats, isHiddenChatsLocked, onShowHiddenChatsPrompt, onToggleHideChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isShowingHidden, setIsShowingHidden] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chat: Chat } | null>(null);
  const { t } = useLanguage();

  const handleHiddenChatsClick = () => {
    if (isHiddenChatsLocked) {
      onShowHiddenChatsPrompt();
    } else {
      setIsShowingHidden(true);
    }
  };
  
  const handleBackToMain = () => {
      setIsShowingHidden(false);
      if (activeChatId && chats.find(c => c.id === activeChatId)?.isHidden) {
          onSelectChat(''); // Deselect chat if it's a hidden one
      }
  };

  const visibleChats = isShowingHidden
    ? chats.filter(chat => chat.isHidden)
    : chats.filter(chat => !chat.isHidden);

  const filteredChats = visibleChats.filter(chat => {
    const name = (chat.type === 'individual' ? chat.user.name : chat.name) || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleContextMenu = (event: React.MouseEvent, chat: Chat) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, chat });
  };
  
  const closeContextMenu = () => setContextMenu(null);

  const contextMenuActions = contextMenu ? [
    {
        label: contextMenu.chat.isHidden ? t('actions.unhideChat') : t('actions.hideChat'),
        onClick: () => {
            onToggleHideChat(contextMenu.chat.id);
            closeContextMenu();
        }
    }
  ] : [];

  return (
    <div className="flex flex-col h-full w-full">
       <header className="p-3 md:p-4 bg-white/30 dark:bg-black/30 border-b border-white/10 dark:border-white/5">
         <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isShowingHidden ? t('hiddenChats.title') : t('contactList.title')}
            </h1>
            {!isShowingHidden && (
                <button 
                    onClick={onNewChat}
                    className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all duration-300"
                    aria-label={t('contactList.newChat')}
                    title={t('contactList.newChat')}
                >
                    <UserPlusIcon className="w-6 h-6"/>
                </button>
            )}
         </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-slate-500 dark:text-slate-400 w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={t('contactList.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-9 pr-4 rounded-lg bg-white/50 dark:bg-black/20 border border-transparent focus:bg-white dark:focus:bg-black/40 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent">
        {!isShowingHidden && hasHiddenChats && (
             <div
              className={`flex items-center p-3 cursor-pointer hover:bg-white/20 dark:hover:bg-white/5 transition-colors`}
              onClick={handleHiddenChatsClick}
            >
              <div className="w-12 flex justify-center">
                  <EyeIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0 border-b border-white/10 py-2">
                  <p className="text-base font-medium text-slate-800 dark:text-slate-200">{t('hiddenChats.title')}</p>
              </div>
            </div>
        )}
         {isShowingHidden && (
            <div
                className="flex items-center p-3 cursor-pointer hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                onClick={handleBackToMain}
            >
                <div className="w-12 flex justify-center">
                    <ChevronLeftIcon className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-base font-medium text-slate-800 dark:text-slate-200">All Chats</p>
            </div>
        )}
        {filteredChats.map((chat) => (
          <div key={chat.id} onContextMenu={(e) => handleContextMenu(e, chat)}>
              <ContactItem
                chat={chat}
                isSelected={chat.id === activeChatId}
                onClick={onSelectChat}
              />
          </div>
        ))}
         {filteredChats.length === 0 && isShowingHidden && (
            <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                <EyeSlashIcon className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-600"/>
                <p className="font-semibold">No Hidden Chats</p>
                <p className="text-sm mt-1">Right-click on a chat to hide it.</p>
            </div>
        )}
      </div>

       {contextMenu && (
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                onClose={closeContextMenu}
                actions={contextMenuActions}
            />
        )}
    </div>
  );
};

export default ContactList;
