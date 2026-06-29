
import React from 'react';
import { Chat, PublicChannelChat } from '../types';
import { SearchIcon } from './icons';

interface ChannelsListProps {
  channels: Chat[];
  onSelectChannel: (id: string) => void;
  onFollow: (id: string) => void;
}

const ChannelItem: React.FC<{ channel: PublicChannelChat; onSelect: () => void; onFollow: () => void; }> = ({ channel, onSelect, onFollow }) => {
    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!channel.isFollowing) {
            onFollow();
        }
        onSelect();
    };

    return (
        <div onClick={onSelect} className="p-3 bg-white dark:bg-[#202c33] hover:bg-gray-50 dark:hover:bg-[#2a3942] rounded-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3 cursor-pointer transition-colors">
            <img src={channel.avatar} alt={channel.name} className="w-12 h-12 rounded-full flex-shrink-0 object-cover" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-gray-800 dark:text-kuik-dark-text-primary truncate">{channel.name}</h3>
                    {!channel.isFollowing && (
                        <button
                            onClick={handleAction}
                            className="px-3 py-1 text-xs font-semibold rounded-full bg-kuik-accent/10 text-kuik-accent hover:bg-kuik-accent hover:text-white transition-colors"
                        >
                            Follow
                        </button>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-kuik-dark-text-secondary truncate mt-0.5">{channel.description}</p>
                 <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{channel.followerCount.toLocaleString()} followers</p>
            </div>
        </div>
    );
};


const ChannelsList: React.FC<ChannelsListProps> = ({ channels, onSelectChannel, onFollow }) => {
    const publicChannels = channels.filter((c): c is PublicChannelChat => c.type === 'public_channel');
    const followingChannels = publicChannels.filter(c => c.isFollowing);
    const discoverChannels = publicChannels.filter(c => !c.isFollowing);

    return (
        <div className="flex flex-col h-full w-full">
            <header className="p-4 bg-gray-50 dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-kuik-dark-text-primary">Channels</h1>
                 <div className="relative mt-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search channels"
                        disabled
                        className="w-full py-2 pl-9 rounded-lg bg-gray-100 dark:bg-[#111b21] border-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    />
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {followingChannels.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Following</h2>
                        <div className="space-y-2">
                            {followingChannels.map(channel => (
                                <ChannelItem 
                                    key={channel.id}
                                    channel={channel}
                                    onSelect={() => onSelectChannel(channel.id)}
                                    onFollow={() => onFollow(channel.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}
                {discoverChannels.length > 0 && (
                    <section>
                         <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Discover</h2>
                        <div className="space-y-2">
                            {discoverChannels.map(channel => (
                                <ChannelItem 
                                    key={channel.id}
                                    channel={channel}
                                    onSelect={() => onSelectChannel(channel.id)}
                                    onFollow={() => onFollow(channel.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ChannelsList;
