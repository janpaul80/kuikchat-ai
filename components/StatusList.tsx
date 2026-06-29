
import React from 'react';
import { UserStatus } from '../types';
import { PlusIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface StatusListProps {
  statuses: UserStatus[];
  onSelectStatus: (status: UserStatus) => void;
  onCreateStatus: () => void;
  currentUserId: string;
}

const StatusListItem: React.FC<{
    name: string;
    avatar: string;
    timestamp: string;
    onClick: () => void;
    hasRing?: boolean;
}> = ({ name, avatar, timestamp, onClick, hasRing = true }) => (
    <div onClick={onClick} className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#202c33] transition-colors">
        <div className="relative">
            <div className={`rounded-full p-0.5 ${hasRing ? 'bg-gradient-to-tr from-yellow-400 to-green-500' : ''}`}>
                <img src={avatar} alt={name} className="w-12 h-12 rounded-full border-2 border-white dark:border-kuik-dark-panel" />
            </div>
        </div>
        <div className="ml-4 flex-1 border-b border-gray-100 dark:border-gray-800 py-2">
            <p className="text-lg font-semibold text-gray-800 dark:text-kuik-dark-text-primary">{name}</p>
            <p className="text-sm text-gray-500 dark:text-kuik-dark-text-secondary">{timestamp}</p>
        </div>
    </div>
);

const StatusList: React.FC<StatusListProps> = ({ statuses, onSelectStatus, onCreateStatus, currentUserId }) => {
    const { t } = useLanguage();
    const myStatus = statuses.find(s => s.userId === currentUserId);
    const otherStatuses = statuses.filter(s => s.userId !== currentUserId);

    const getTimeAgo = (timestamp: number): string => {
        const now = Date.now();
        const seconds = Math.floor((now - timestamp) / 1000);
        if (seconds < 60) return t("status.justNow");
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t("status.minutesAgo", { minutes });
        const hours = Math.floor(minutes / 60);
        return t("status.hoursAgo", { hours });
    };

    return (
        <div className="flex flex-col h-full w-full">
            <header className="p-4 bg-gray-50 dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-kuik-dark-text-primary">{t('status.title')}</h1>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div onClick={myStatus ? () => onSelectStatus(myStatus) : onCreateStatus} className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#202c33] transition-colors">
                    <div className="relative">
                        {myStatus ? (
                            <div className="rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-green-500">
                                <img src={myStatus.userAvatar} alt={t('status.myStatus')} className="w-12 h-12 rounded-full border-2 border-white dark:border-kuik-dark-panel" />
                            </div>
                        ) : (
                            <img src={`https://i.pravatar.cc/150?u=${currentUserId}`} alt={t('status.myStatus')} className="w-12 h-12 rounded-full" />
                        )}
                        <div onClick={(e) => { e.stopPropagation(); onCreateStatus(); }} className="absolute bottom-0 right-0 bg-kuik-accent text-white rounded-full p-0.5 border-2 border-white dark:border-kuik-dark-panel">
                            <PlusIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="ml-4 flex-1 border-b border-gray-100 dark:border-gray-800 py-2">
                        <p className="text-lg font-semibold text-gray-800 dark:text-kuik-dark-text-primary">{t('status.myStatus')}</p>
                        <p className="text-sm text-gray-500 dark:text-kuik-dark-text-secondary">
                            {myStatus ? getTimeAgo(myStatus.items[myStatus.items.length-1].timestamp) : t('status.addStatus')}
                        </p>
                    </div>
                </div>

                {otherStatuses.length > 0 && (
                    <div className="pt-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-4 py-2 uppercase tracking-wide">{t('status.recentUpdates')}</p>
                        {otherStatuses.map(status => (
                            <StatusListItem
                                key={status.userId}
                                name={status.userName}
                                avatar={status.userAvatar}
                                timestamp={getTimeAgo(status.items[status.items.length - 1].timestamp)}
                                onClick={() => onSelectStatus(status)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusList;
