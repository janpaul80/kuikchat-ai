
import React, { useState } from 'react';
import { GroupChat, User } from '../types';
import { ChevronLeftIcon, PhotoIcon, ChevronDownIcon, QrCodeIcon } from './icons';
import ContextMenu from './ContextMenu';
import { useLanguage } from '../contexts/LanguageContext';

interface GroupInfoViewProps {
  groupChat: GroupChat;
  currentUser: User;
  onClose: () => void;
  onPromote: (chatId: string, userId: string) => void;
  onDemote: (chatId: string, userId: string) => void;
  onRemove: (chatId: string, userId: string) => void;
  onChangePermission: (chatId: string, permission: 'sendMessages' | 'editInfo', value: 'all' | 'admins') => void;
}

const ParticipantItem: React.FC<{
  participant: User;
  isCurrentUser: boolean;
  isAdmin: boolean;
  canManage: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onRemove: () => void;
}> = ({ participant, isCurrentUser, isAdmin, canManage, onPromote, onDemote, onRemove }) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isCurrentUser && canManage) {
        setContextMenu({ x: event.clientX, y: event.clientY });
    }
  };

  const actions = [];
  if (isAdmin) {
      actions.push({ label: 'Dismiss as admin', onClick: onDemote });
  } else {
      actions.push({ label: 'Make group admin', onClick: onPromote });
  }
  actions.push({ label: `Remove ${participant.name}`, onClick: onRemove });

  return (
    <div
      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-kuik-dark-header rounded-lg"
      onContextMenu={handleContextMenu}
    >
      <img src={participant.avatar} alt={participant.name} className="w-12 h-12 rounded-full mr-4" />
      <div className="flex-1">
        <p className="font-medium text-gray-800 dark:text-kuik-dark-text-primary">{participant.name}{isCurrentUser && ' (You)'}</p>
        <p className="text-sm text-gray-500 dark:text-kuik-dark-text-secondary -mt-1">{participant.username}</p>
        {isAdmin && (
            <span className="text-xs font-semibold text-kuik-green dark:text-kuik-light-green">Group Admin</span>
        )}
      </div>
      {!isCurrentUser && canManage && (
        <button onClick={handleContextMenu} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-kuik-dark-panel">
            <ChevronDownIcon className="w-5 h-5" />
        </button>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={actions}
        />
      )}
    </div>
  );
};

const GroupInfoView: React.FC<GroupInfoViewProps> = ({ 
    groupChat, 
    currentUser, 
    onClose, 
    onPromote, 
    onDemote, 
    onRemove, 
    onChangePermission 
}) => {
    const isCurrentUserAdmin = groupChat.admins.includes(currentUser.id);
    const { t } = useLanguage();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=kuikchat-group:${groupChat.id}&color=075E54&bgcolor=ffffff&qzone=1`;

  return (
    <div className="fixed inset-0 bg-white dark:bg-kuik-dark-bg z-40 flex flex-col animate-fade-in">
      <header className="flex-shrink-0 bg-kuik-light-green text-white p-4 flex items-center shadow-md">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
          <ChevronLeftIcon className="w-6 h-6 transform -translate-x-0.5" />
        </button>
        <h2 className="text-xl font-semibold ml-4">Group Info</h2>
      </header>
      <div className="flex-1 overflow-y-auto">
        {/* Group Header */}
        <section className="flex flex-col items-center p-6 bg-gray-50 dark:bg-kuik-dark-panel border-b border-gray-200 dark:border-gray-700">
            <div className="relative mb-4">
                <img src={groupChat.avatar} alt={groupChat.name} className="w-40 h-40 rounded-full shadow-lg"/>
                <button className="absolute -bottom-1 -right-1 bg-kuik-accent text-white p-2 rounded-full hover:bg-kuik-green shadow-md">
                    <PhotoIcon className="w-6 h-6"/>
                </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-kuik-dark-text-primary mt-2">{groupChat.name}</h1>
            <p className="text-sm text-gray-500 dark:text-kuik-dark-text-secondary">
                Group · {groupChat.participants.length} participants
            </p>
        </section>

        {/* QR Code Section */}
        <section className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-kuik-dark-header flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
                <QrCodeIcon className="w-6 h-6 text-kuik-accent"/>
                <h3 className="text-base font-semibold text-gray-800 dark:text-kuik-dark-text-primary">{t('groupInfo.qrCodeTitle')}</h3>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <img src={qrCodeUrl} alt="Group QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm text-gray-500 dark:text-kuik-dark-text-secondary mt-3">{t('groupInfo.qrCodeDesc')}</p>
        </section>

        {/* Participants List */}
        <section className="p-4">
            <h3 className="text-base font-semibold text-kuik-green dark:text-kuik-light-green mb-2 px-3">Participants</h3>
            <div>
                {groupChat.participants.map(p => (
                    <ParticipantItem 
                        key={p.id}
                        participant={p}
                        isCurrentUser={p.id === currentUser.id}
                        isAdmin={groupChat.admins.includes(p.id)}
                        canManage={isCurrentUserAdmin}
                        onPromote={() => onPromote(groupChat.id, p.id)}
                        onDemote={() => onDemote(groupChat.id, p.id)}
                        onRemove={() => onRemove(groupChat.id, p.id)}
                    />
                ))}
            </div>
        </section>
        
        {/* Group Settings - Admin only */}
        {isCurrentUserAdmin && (
            <section className="p-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                 <h3 className="text-base font-semibold text-kuik-green dark:text-kuik-light-green mb-4 px-3">Group Settings</h3>
                 <div className="space-y-4 px-3">
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-kuik-dark-text-primary">Send messages</h4>
                        <div className="flex items-center mt-2 space-x-4">
                            <label className="flex items-center text-sm text-gray-600 dark:text-kuik-dark-text-secondary">
                                <input 
                                    type="radio" 
                                    name="sendMessages" 
                                    value="all"
                                    checked={groupChat.permissions.sendMessages === 'all'}
                                    onChange={() => onChangePermission(groupChat.id, 'sendMessages', 'all')}
                                    className="h-4 w-4 text-kuik-accent focus:ring-kuik-light-green border-gray-300 dark:border-gray-500"
                                />
                                <span className="ml-2">All participants</span>
                            </label>
                             <label className="flex items-center text-sm text-gray-600 dark:text-kuik-dark-text-secondary">
                                <input 
                                    type="radio" 
                                    name="sendMessages" 
                                    value="admins"
                                    checked={groupChat.permissions.sendMessages === 'admins'}
                                    onChange={() => onChangePermission(groupChat.id, 'sendMessages', 'admins')}
                                    className="h-4 w-4 text-kuik-accent focus:ring-kuik-light-green border-gray-300 dark:border-gray-500"
                                />
                                <span className="ml-2">Only admins</span>
                            </label>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-medium text-gray-800 dark:text-kuik-dark-text-primary">Edit group info</h4>
                        <div className="flex items-center mt-2 space-x-4">
                            <label className="flex items-center text-sm text-gray-600 dark:text-kuik-dark-text-secondary">
                                <input 
                                    type="radio" 
                                    name="editInfo" 
                                    value="all"
                                    checked={groupChat.permissions.editInfo === 'all'}
                                    onChange={() => onChangePermission(groupChat.id, 'editInfo', 'all')}
                                    className="h-4 w-4 text-kuik-accent focus:ring-kuik-light-green border-gray-300 dark:border-gray-500"
                                />
                                <span className="ml-2">All participants</span>
                            </label>
                             <label className="flex items-center text-sm text-gray-600 dark:text-kuik-dark-text-secondary">
                                <input 
                                    type="radio" 
                                    name="editInfo" 
                                    value="admins"
                                    checked={groupChat.permissions.editInfo === 'admins'}
                                    onChange={() => onChangePermission(groupChat.id, 'editInfo', 'admins')}
                                    className="h-4 w-4 text-kuik-accent focus:ring-kuik-light-green border-gray-300 dark:border-gray-500"
                                />
                                <span className="ml-2">Only admins</span>
                            </label>
                        </div>
                    </div>
                 </div>
            </section>
        )}
      </div>
    </div>
  );
};

export default GroupInfoView;
