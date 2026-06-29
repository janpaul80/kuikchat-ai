
import React from 'react';
import { Community } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CommunitiesViewProps {
  myCommunities: Community[];
  discoverCommunities: Community[];
  onJoin: (communityId: string) => void;
}

const CommunityCard: React.FC<{ community: Community; onJoin: () => void; isJoined: boolean }> = ({ community, onJoin, isJoined }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white dark:bg-[#202c33] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center text-center">
            <img src={community.avatar} alt={community.name} className="w-16 h-16 rounded-lg mb-3 object-cover" />
            <h3 className="text-base font-bold text-gray-800 dark:text-kuik-dark-text-primary">{community.name}</h3>
            <p className="text-xs text-gray-500 dark:text-kuik-dark-text-secondary mt-1 flex-1 line-clamp-2">{community.description}</p>
            {!isJoined && (
                <button
                    onClick={onJoin}
                    className="mt-3 w-full px-3 py-1.5 bg-kuik-accent/10 text-kuik-accent font-semibold text-sm rounded-full hover:bg-kuik-accent hover:text-white transition-colors"
                >
                    {t('communities.join')}
                </button>
            )}
        </div>
    );
}

const CommunitiesView: React.FC<CommunitiesViewProps> = ({ myCommunities, discoverCommunities, onJoin }) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col h-full w-full">
      <header className="p-4 bg-gray-50 dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-kuik-dark-text-primary">{t('communities.title')}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {myCommunities.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('communities.myCommunities')}</h2>
            <div className="space-y-2">
                {myCommunities.map(community => (
                     <div key={community.id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors">
                        <img src={community.avatar} alt={community.name} className="w-10 h-10 rounded-lg mr-3 object-cover" />
                        <div>
                            <p className="text-base font-semibold text-gray-800 dark:text-kuik-dark-text-primary">{community.name}</p>
                            <p className="text-xs text-gray-500 dark:text-kuik-dark-text-secondary">{t('communities.channels', { count: community.channels.length })}</p>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}

        {discoverCommunities.length > 0 && (
            <section>
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('communities.discover')}</h2>
                <div className="grid grid-cols-1 gap-3">
                    {discoverCommunities.map(community => (
                        <CommunityCard 
                            key={community.id}
                            community={community}
                            onJoin={() => onJoin(community.id)}
                            isJoined={false}
                        />
                    ))}
                </div>
            </section>
        )}
      </div>
    </div>
  );
};

export default CommunitiesView;
