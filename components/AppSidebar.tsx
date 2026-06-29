
import React from 'react';
import { ChatBubbleIcon, StatusIcon, SettingsIcon, CommunityIcon } from './icons';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '../contexts/LanguageContext';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69271ae39e2fa4537095edbd/b6ebabbd5_photo_5852914653850176866_y.jpg";

interface AppSidebarProps {
  activeView: 'chats' | 'status' | 'communities';
  setActiveView: (view: 'chats' | 'status' | 'communities') => void;
  onOpenSettings: () => void;
  isHiddenOnMobile?: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeView, setActiveView, onOpenSettings, isHiddenOnMobile = false }) => {
  const { t } = useLanguage();
  
  const commonButtonClasses = "p-3 rounded-xl transition-all duration-300 group relative flex items-center justify-center";
  const activeButtonClasses = "bg-gradient-to-br from-[#2563eb] to-[#22c55e] text-white shadow-lg shadow-blue-500/25";
  const inactiveButtonClasses = "text-slate-500 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200";

  return (
    <div className={`w-full h-16 md:w-20 md:h-full bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-2xl flex flex-row md:flex-col items-center justify-between py-1 md:py-6 border-t md:border-t-0 md:border-r border-white/20 dark:border-slate-700/30 shadow-sm z-30 ${isHiddenOnMobile ? 'hidden md:flex' : 'flex'}`}>
      
      {/* Top/Left: Logo & Main Nav */}
      <div className="flex flex-row md:flex-col items-center justify-around w-full md:w-auto md:space-y-6 px-2">
          {/* Logo on Desktop only */}
          <div className="hidden md:flex mb-4 p-2">
             <img src={LOGO_URL} alt="KuikChat" className="w-10 h-10 rounded-xl shadow-md" />
          </div>

          <button
            onClick={() => setActiveView('chats')}
            className={`${commonButtonClasses} ${activeView === 'chats' ? activeButtonClasses : inactiveButtonClasses}`}
            aria-label={t('sidebar.chats')}
            title={t('sidebar.chats')}
          >
            <ChatBubbleIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveView('status')}
            className={`${commonButtonClasses} ${activeView === 'status' ? activeButtonClasses : inactiveButtonClasses}`}
            aria-label={t('sidebar.status')}
            title={t('sidebar.status')}
          >
            <StatusIcon className="w-6 h-6" />
          </button>
           <button
            onClick={() => setActiveView('communities')}
            className={`${commonButtonClasses} ${activeView === 'communities' ? activeButtonClasses : inactiveButtonClasses}`}
            aria-label={t('sidebar.communities')}
            title={t('sidebar.communities')}
          >
            <CommunityIcon className="w-6 h-6" />
          </button>
          
          {/* Mobile Settings Button */}
          <button
            onClick={onOpenSettings}
            className={`${commonButtonClasses} ${inactiveButtonClasses} md:hidden`}
            aria-label={t('sidebar.settings')}
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
      </div>

      {/* Bottom/Right: Settings & Theme (Desktop Only) */}
      <div className="hidden md:flex flex-col items-center space-y-4 w-full px-2">
        <button
            onClick={onOpenSettings}
            className={`${commonButtonClasses} ${inactiveButtonClasses}`}
            aria-label={t('sidebar.settings')}
            title={t('sidebar.settings')}
        >
            <SettingsIcon className="w-6 h-6" />
        </button>
        <div className="p-2">
            <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
