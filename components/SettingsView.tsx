
import React, { useState, useRef, useEffect } from 'react';
import { 
    CloseIcon, CloudUploadIcon, CloudDownloadIcon, CameraIcon, 
    UserCircleIcon, QrCodeIcon, ListIcon, MegaphoneIcon, StarIcon, LaptopIcon,
    KeyIcon, LockClosedIcon, ChatBubbleIcon, BellIcon, DataIcon, HelpIcon, ChevronRightIcon,
    SunIcon, MoonIcon, CheckIcon, ChevronLeftIcon, UserPlusIcon, TrashIcon
} from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';

// --- Constants ---

const WALLPAPERS = [
    { id: 'default', color: '', label: 'Default' },
    { id: 'color1', color: '#e5ddd5', label: 'Beige' },
    { id: 'color2', color: '#ccebdc', label: 'Mint' },
    { id: 'color3', color: '#aed8c7', label: 'Teal' },
    { id: 'color4', color: '#7acba5', label: 'Green' },
    { id: 'color5', color: '#cbdaec', label: 'Blue Ice' },
    { id: 'color6', color: '#66d2d5', label: 'Sky' },
    { id: 'color7', color: '#63bdcf', label: 'Blue' },
    { id: 'color8', color: '#d6d0f0', label: 'Lavender' },
    { id: 'color9', color: '#cecece', label: 'Gray' },
    { id: 'image1', url: 'https://images.unsplash.com/photo-1554188248-986b70c2ebbe?w=500&auto=format&fit=crop&q=60', label: 'Shadows' },
    { id: 'image2', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=500&auto=format&fit=crop&q=60', label: 'Gradient' },
    { id: 'image3', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60', label: 'Fluid' },
    { id: 'image4', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60', label: 'Sea' },
    { id: 'image5', url: 'https://images.unsplash.com/photo-1518098268026-4e1878517fe4?w=500&auto=format&fit=crop&q=60', label: 'Space' },
];

const PROFILE_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
    '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'
];

// --- Helper Components ---

const SettingsItem = ({ 
    icon: Icon, 
    label, 
    onClick, 
    color = "bg-blue-500", 
    badge, 
    value,
    isDestructive,
    hasBorder = true
}: { 
    icon?: React.FC<{className?: string}>, 
    label: string, 
    onClick?: () => void, 
    color?: string, 
    badge?: string,
    value?: string,
    isDestructive?: boolean,
    hasBorder?: boolean
}) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-3 bg-[#2c2c2e] active:bg-[#3a3a3c] transition-colors cursor-pointer group`}
    >
        <div className="flex items-center gap-3.5">
            {Icon && (
                <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            )}
            <span className={`text-[16px] ${isDestructive ? 'text-red-500' : 'text-white'}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-gray-400 text-[15px]">{value}</span>}
            {badge && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>}
            <ChevronRightIcon className="w-4 h-4 text-gray-500/70" />
        </div>
    </div>
);

const SettingsSection = ({ title, children }: { title?: string, children: React.ReactNode }) => (
    <div className="mb-8">
        {title && <h3 className="text-gray-500 text-[13px] uppercase font-medium mb-2 pl-4 tracking-wide">{title}</h3>}
        <div className="rounded-[10px] overflow-hidden bg-[#2c2c2e] divide-y divide-gray-700/50">
            {children}
        </div>
    </div>
);

// --- Sub-Views ---

interface EditProfileViewProps {
  user: User;
  onClose: () => void;
  onSave: (name: string, avatar: string, about: string, aboutDuration: number, profileColor: string) => void;
}

const EditProfileView: React.FC<EditProfileViewProps> = ({ user, onClose, onSave }) => {
  const { t } = useLanguage();
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [about, setAbout] = useState(user.about || '');
  const [profileColor, setProfileColor] = useState(user.profileColor || PROFILE_COLORS[6]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), avatar, about.trim(), 0, profileColor);
      onClose();
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
        <header className="flex items-center justify-between px-4 h-[60px] bg-[#1c1c1e] sticky top-0 z-10">
            <button onClick={onClose} className="text-[#0a84ff] text-[17px]">{t('settings.editProfile.cancel')}</button>
            <h2 className="text-[17px] font-semibold text-white">{t('settings.editProfile.title')}</h2>
            <button onClick={handleSave} className="text-[#0a84ff] font-semibold text-[17px]">{t('settings.editProfile.save')}</button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Avatar Section */}
            <div className="flex flex-col items-center py-6">
                <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
                    <img src={avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CameraIcon className="w-8 h-8 text-white" />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <button onClick={triggerFileSelect} className="mt-3 text-[#0a84ff] text-sm">
                    {t('settings.editProfile.changePhoto')}
                </button>
            </div>

            {/* Name Section */}
            <SettingsSection>
                <div className="p-3 bg-[#2c2c2e] flex flex-col">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-white outline-none text-[17px] placeholder-gray-500"
                        placeholder="Name"
                    />
                </div>
                <div className="p-3 bg-[#2c2c2e]">
                    <input
                        type="text"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="w-full bg-transparent text-white outline-none text-[17px] placeholder-gray-500"
                        placeholder="About"
                    />
                </div>
            </SettingsSection>

            {/* Color Picker */}
            <SettingsSection title={t('settings.editProfile.colorLabel')}>
                <div className="p-4 bg-[#2c2c2e] flex flex-wrap gap-4 justify-center">
                    {PROFILE_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => setProfileColor(color)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${profileColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </SettingsSection>
        </div>
    </div>
  );
};

// --- Main Settings Component ---

interface SettingsViewProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onBackup: () => void;
  onRestore: () => void;
  lastBackupTimestamp: string | null;
  onSetDefaultTimer: (duration: number) => void;
  defaultTimer: number;
  hasHiddenChatsPassword?: boolean;
  onChangePassword: () => void;
  onResetHiddenChats: () => void;
  onUpdateProfile: (name: string, avatar: string, about: string, aboutDuration: number, profileColor: string) => void;
  onLogout: () => void;
  onSetWallpaper: (url: string) => void;
  currentWallpaper: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    currentUser, 
    isOpen, 
    onClose, 
    onBackup, 
    onRestore, 
    lastBackupTimestamp, 
    onSetDefaultTimer, 
    defaultTimer, 
    hasHiddenChatsPassword, 
    onChangePassword, 
    onResetHiddenChats, 
    onUpdateProfile, 
    onLogout,
    onSetWallpaper,
    currentWallpaper
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  // Expanded view state to include all sub-menus
  const [currentView, setCurrentView] = useState<
    'main' | 'profile' | 'privacy' | 'chats' | 'notifications' | 'help' | 
    'account' | 'linked_devices' | 'storage' | 'lists' | 'broadcast' | 'starred' | 
    'wallpaper' | 
    'account_passkeys' | 'account_email' | 'account_two_step' | 'account_change_number' | 'account_request_info' | 'account_delete'
  >('main');
  
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
      if (isOpen) setCurrentView('main');
  }, [isOpen]);

  useEffect(() => {
      if (currentUser) {
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=kuikchat:${currentUser.username}&color=000000&bgcolor=ffffff&qzone=1`);
      }
  }, [currentUser]);

  if (!isOpen) return null;

  const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return t('settings.noBackup');
    try {
      return new Date(timestamp).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // --- Render Sub-Views Logic ---

  const renderWallpaperView = () => (
      <div className="flex flex-col h-full bg-black">
          <div className="p-4 grid grid-cols-3 gap-2">
              {WALLPAPERS.map(wp => (
                  <div 
                    key={wp.id}
                    onClick={() => onSetWallpaper(wp.url || '')}
                    className={`relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer ${currentWallpaper === (wp.url || '') ? 'ring-2 ring-[#0a84ff]' : ''}`}
                  >
                      {wp.url ? (
                          <img src={wp.url} alt={wp.label} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full" style={{ backgroundColor: wp.color || '#1c1c1e' }}></div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] p-1 text-center truncate">
                          {wp.label}
                      </div>
                      {currentWallpaper === (wp.url || '') && (
                          <div className="absolute top-1 right-1 bg-[#0a84ff] rounded-full p-0.5">
                              <CheckIcon className="w-3 h-3 text-white" />
                          </div>
                      )}
                  </div>
              ))}
          </div>
          <div className="p-4">
              <button 
                onClick={() => onSetWallpaper('')}
                className="w-full py-3 bg-[#2c2c2e] text-[#ff453a] font-medium rounded-xl active:bg-[#3a3a3c]"
              >
                  Reset Wallpaper
              </button>
          </div>
      </div>
  );

  const renderAccountView = () => (
      <div className="flex flex-col h-full p-4 bg-black">
          <SettingsSection>
              <SettingsItem label="Passkeys" onClick={() => setCurrentView('account_passkeys')} />
              <SettingsItem label="Email address" onClick={() => setCurrentView('account_email')} />
              <SettingsItem label="Two-step verification" onClick={() => setCurrentView('account_two_step')} />
              <SettingsItem label="Change number" onClick={() => setCurrentView('account_change_number')} />
          </SettingsSection>
          
          <SettingsSection>
              <SettingsItem label="Request account info" onClick={() => setCurrentView('account_request_info')} />
          </SettingsSection>

          <SettingsSection>
              <SettingsItem label="Add account" onClick={() => alert("Multi-account support coming soon!")} />
              <SettingsItem label="Delete account" isDestructive onClick={() => setCurrentView('account_delete')} />
          </SettingsSection>
      </div>
  );

  // -- Account Sub Views --
  
  const renderPasskeysView = () => (
      <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#1c1c1e] rounded-full flex items-center justify-center mb-6">
            <KeyIcon className="w-10 h-10 text-[#0a84ff]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Passkeys</h3>
          <p className="text-gray-400 mb-8 max-w-xs">Use your fingerprint, face, or screen lock to verify it's you.</p>
          <button className="w-full py-3 bg-[#0a84ff] text-white font-semibold rounded-full active:bg-blue-600 transition-colors">Create passkey</button>
      </div>
  );

  const renderEmailView = () => (
      <div className="p-4">
          <p className="text-gray-400 text-sm mb-6 px-2">Email helps you access your account. It isn't visible to others.</p>
          <div className="bg-[#2c2c2e] rounded-xl px-4 py-2 mb-2">
            <input type="email" placeholder="Email" className="w-full py-2 bg-transparent text-white outline-none placeholder-gray-500" autoFocus />
          </div>
          <p className="text-gray-500 text-xs px-2">Verification code will be sent.</p>
      </div>
  );

  const renderTwoStepView = () => (
      <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#1c1c1e] rounded-full flex items-center justify-center mb-6">
            <LockClosedIcon className="w-10 h-10 text-[#30d158]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Two-step verification</h3>
          <p className="text-gray-400 mb-8 max-w-xs">For extra security, turn on two-step verification.</p>
          <button className="w-full py-3 bg-[#30d158] text-white font-semibold rounded-full active:bg-green-600 transition-colors">Turn on</button>
      </div>
  );

  const renderChangeNumberView = () => (
      <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#1c1c1e] rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">📱</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Change Number</h3>
          <p className="text-gray-400 mb-8 max-w-xs">Migrate your account info, groups & settings.</p>
          <button className="w-full py-3 bg-[#0a84ff] text-white font-semibold rounded-full active:bg-blue-600 transition-colors">Next</button>
      </div>
  );

  const renderRequestInfoView = () => (
      <div className="p-4">
          <SettingsSection>
            <div className="p-4 bg-[#2c2c2e] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0a84ff]/20 flex items-center justify-center">
                    <DataIcon className="w-6 h-6 text-[#0a84ff]" />
                </div>
                <div>
                    <h4 className="text-white font-medium">Request report</h4>
                    <p className="text-gray-400 text-sm">Get a report of your account info.</p>
                </div>
            </div>
          </SettingsSection>
      </div>
  );

  const renderDeleteAccountView = () => (
      <div className="p-4">
          <div className="bg-[#2c2c2e] p-4 rounded-xl flex gap-4 mb-6">
              <div className="mt-1 text-[#ff453a]"><TrashIcon className="w-6 h-6" /></div>
              <div>
                  <h4 className="text-[#ff453a] font-bold mb-2">Deleting your account will:</h4>
                  <ul className="list-disc pl-4 text-gray-400 text-sm space-y-1">
                      <li>Delete your account info and photo</li>
                      <li>Delete you from all groups</li>
                      <li>Delete your message history</li>
                  </ul>
              </div>
          </div>
          
          <div className="mb-6">
              <p className="text-white text-sm mb-2 font-medium">Phone number</p>
              <div className="flex gap-2">
                  <div className="w-20 p-3 bg-[#2c2c2e] rounded-xl text-gray-400 text-center font-mono">+1</div>
                  <input type="tel" placeholder="phone number" className="flex-1 p-3 bg-[#2c2c2e] rounded-xl text-white outline-none placeholder-gray-500" />
              </div>
          </div>

          <button className="w-full py-3 bg-[#ff453a] text-white font-bold rounded-full active:opacity-90 transition-opacity">
              Delete Account
          </button>
      </div>
  );

  // -- Other Views --

  const renderLinkedDevicesView = () => (
      <div className="flex flex-col h-full bg-black items-center pt-12 p-4">
          <LaptopIcon className="w-32 h-32 text-[#64d2ff] mb-6 opacity-80" />
          <h3 className="text-2xl font-bold text-white mb-2 text-center">Use KuikChat on other devices</h3>
          <button className="bg-[#0a84ff] text-white font-bold py-3 px-8 rounded-full active:bg-blue-600 transition-colors mb-10 shadow-lg w-full max-w-xs">
              Link a Device
          </button>
          <div className="w-full">
              <h4 className="text-gray-500 text-xs uppercase font-bold mb-2 pl-4">Linked Devices</h4>
              <SettingsSection>
                  <div className="flex items-center p-3">
                      <LaptopIcon className="w-8 h-8 text-gray-400 mr-4" />
                      <div>
                          <p className="text-white font-medium">Google Chrome (Windows)</p>
                          <p className="text-[#30d158] text-xs font-medium">Active now</p>
                      </div>
                  </div>
              </SettingsSection>
          </div>
      </div>
  );

  const renderStorageView = () => (
      <div className="flex flex-col h-full p-4 bg-black">
          <SettingsSection>
              <SettingsItem label="Manage storage" value="1.2 GB" onClick={() => {}} />
          </SettingsSection>
          <SettingsSection title="Network Usage">
              <SettingsItem label="Network usage" value="450 MB" onClick={() => {}} />
          </SettingsSection>
      </div>
  );

  const renderStarredView = () => (
      <div className="flex flex-col h-full bg-black items-center justify-center p-8 text-center">
          <div className="w-32 h-32 bg-[#2c2c2e] rounded-full flex items-center justify-center mb-6">
              <StarIcon className="w-16 h-16 text-[#ffd60a]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Starred Messages</h3>
          <p className="text-gray-400 max-w-xs">Tap and hold on any message to star it.</p>
      </div>
  );

  const renderListsView = () => (
      <div className="flex flex-col h-full bg-black p-4">
          <div className="flex items-center justify-center py-12">
              <ListIcon className="w-24 h-24 text-[#30d158] opacity-50" />
          </div>
          <SettingsSection>
              <SettingsItem label="Create new list" icon={ListIcon} color="bg-[#0a84ff]" onClick={() => alert("Feature Coming Soon")} />
          </SettingsSection>
      </div>
  );

  const renderBroadcastView = () => (
      <div className="flex flex-col h-full bg-black p-4">
          <div className="flex items-center justify-center py-12">
              <MegaphoneIcon className="w-24 h-24 text-[#30d158] opacity-50" />
          </div>
          <SettingsSection>
              <SettingsItem label="New Broadcast" icon={MegaphoneIcon} color="bg-[#30d158]" onClick={() => alert("Feature Coming Soon")} />
          </SettingsSection>
      </div>
  );

  const renderPrivacyView = () => (
      <div className="flex flex-col h-full p-4 bg-black">
          <SettingsSection title="Security">
              <div className="bg-[#2c2c2e] p-4">
                  <h4 className="text-white font-medium mb-1">{t('hiddenChats.title')}</h4>
                  {hasHiddenChatsPassword ? (
                      <div className="space-y-3 mt-3">
                          <button onClick={onChangePassword} className="w-full text-left text-[#0a84ff] text-[16px] active:opacity-60">{t('settings.changePassword')}</button>
                          <div className="h-px bg-gray-700/50"></div>
                          <button onClick={onResetHiddenChats} className="w-full text-left text-[#ff453a] text-[16px] active:opacity-60">{t('settings.resetHiddenChats')}</button>
                      </div>
                  ) : (
                      <p className="text-gray-500 text-sm italic">{t('settings.noPasswordSet')}</p>
                  )}
              </div>
          </SettingsSection>
          <SettingsSection title="Disappearing Messages">
              <div className="bg-[#2c2c2e] p-3 flex items-center justify-between">
                  <span className="text-white text-[16px]">{t('settings.timerTitle')}</span>
                  <select 
                      value={defaultTimer}
                      onChange={(e) => onSetDefaultTimer(Number(e.target.value))}
                      className="bg-transparent text-[#0a84ff] text-[16px] outline-none text-right cursor-pointer"
                  >
                      <option value={0}>{t('time.off')}</option>
                      <option value={5000}>{t('time.seconds_5')}</option>
                      <option value={10000}>{t('time.seconds_10')}</option>
                      <option value={60000}>{t('time.minute_1')}</option>
                  </select>
              </div>
          </SettingsSection>
      </div>
  );

  const renderChatsView = () => (
      <div className="flex flex-col h-full p-4 bg-black">
          <SettingsSection title="DISPLAY">
              <div onClick={toggleTheme} className="flex items-center justify-between p-3 bg-[#2c2c2e] active:bg-[#3a3a3c] cursor-pointer border-b border-gray-700/50">
                  <span className="text-white text-[16px]">Theme</span>
                  <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-[15px] capitalize">{theme}</span>
                      {theme === 'light' ? <SunIcon className="w-4 h-4 text-yellow-400" /> : <MoonIcon className="w-4 h-4 text-[#0a84ff]" />}
                  </div>
              </div>
              <SettingsItem label="Wallpaper" value="Default" onClick={() => setCurrentView('wallpaper')} />
          </SettingsSection>

          <SettingsSection title="LANGUAGE">
               <div className="flex items-center justify-between p-3 bg-[#2c2c2e]">
                  <span className="text-white text-[16px]">App Language</span>
                  <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-transparent text-[#0a84ff] text-[16px] outline-none text-right cursor-pointer"
                  >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                  </select>
              </div>
          </SettingsSection>

          <SettingsSection title="CHAT BACKUP">
              <div className="bg-[#2c2c2e] p-4 flex flex-col gap-3">
                  <p className="text-gray-400 text-xs">{t('settings.lastBackup')} <span className="text-white">{formatTimestamp(lastBackupTimestamp)}</span></p>
                  <button onClick={onBackup} className="w-full py-2 bg-[#0a84ff] rounded-lg text-white text-sm font-medium active:bg-blue-600 flex items-center justify-center gap-2"><CloudUploadIcon className="w-4 h-4" />{t('settings.backupNow')}</button>
                  <button onClick={onRestore} className="w-full py-2 bg-[#3a3a3c] rounded-lg text-[#0a84ff] text-sm font-medium active:bg-[#48484a] flex items-center justify-center gap-2"><CloudDownloadIcon className="w-4 h-4" />{t('settings.restore')}</button>
              </div>
          </SettingsSection>
      </div>
  );

  // --- Main Header and Layout ---

  const renderHeader = (title: string, backAction?: () => void) => (
      <header className="flex items-center justify-between px-2 bg-[#1c1c1e] border-b border-gray-800 sticky top-0 z-10 h-[60px]">
          <div className="flex-1 flex justify-start">
            {backAction ? (
                <button onClick={backAction} className="flex items-center text-[#0a84ff] text-[17px] font-normal active:opacity-50 transition-opacity pl-2">
                    <ChevronLeftIcon className="w-6 h-6 -ml-2" /> 
                    {currentView.startsWith('account_') ? 'Account' : (currentView === 'wallpaper' ? 'Chats' : 'Settings')}
                </button>
            ) : (
                <div />
            )}
          </div>
          <h2 className="text-[17px] font-semibold text-white text-center absolute left-1/2 transform -translate-x-1/2">{title}</h2>
          <div className="flex-1 flex justify-end pr-2">
              {!backAction && (
                  <button onClick={onClose} className="p-1.5 bg-[#2c2c2e] rounded-full active:bg-[#3a3a3c] transition-colors">
                      <CloseIcon className="w-5 h-5 text-gray-400" />
                  </button>
              )}
          </div>
      </header>
  );

  const renderViewContent = () => {
      switch (currentView) {
          case 'main': return renderMainView();
          case 'profile': return <EditProfileView user={currentUser} onClose={() => setCurrentView('main')} onSave={onUpdateProfile} />;
          case 'privacy': return renderSubView(t('settings.privacyTitle'), renderPrivacyView);
          case 'chats': return renderSubView("Chats", renderChatsView);
          case 'account': return renderSubView("Account", renderAccountView);
          case 'linked_devices': return renderSubView("Linked Devices", renderLinkedDevicesView);
          case 'storage': return renderSubView("Storage and Data", renderStorageView);
          case 'starred': return renderSubView("Starred Messages", renderStarredView);
          case 'lists': return renderSubView("Lists", renderListsView);
          case 'broadcast': return renderSubView("Broadcast", renderBroadcastView);
          case 'wallpaper': return renderSubView("Wallpaper", renderWallpaperView);
          
          // Account Sub-menus
          case 'account_passkeys': return renderSubView("Passkeys", renderPasskeysView);
          case 'account_email': return renderSubView("Email Address", renderEmailView);
          case 'account_two_step': return renderSubView("Two-Step Verification", renderTwoStepView);
          case 'account_change_number': return renderSubView("Change Number", renderChangeNumberView);
          case 'account_request_info': return renderSubView("Request Account Info", renderRequestInfoView);
          case 'account_delete': return renderSubView("Delete Account", renderDeleteAccountView);

          case 'notifications': return renderSubView("Notifications", () => (
              <div className="flex-1 bg-black p-4">
                  <SettingsSection>
                      <div className="bg-[#2c2c2e] p-4 text-center">
                          <p className="text-white mb-4">Notification preferences are managed by your browser.</p>
                          <button className="text-[#0a84ff] text-[16px]">System Settings</button>
                      </div>
                  </SettingsSection>
              </div>
          ));
          case 'help': return renderSubView("Help", () => (
              <div className="flex-1 bg-black p-4">
                  <SettingsSection>
                      <SettingsItem label="Help Center" onClick={() => window.open('/#help', '_blank')} />
                      <SettingsItem label="Contact Us" onClick={() => window.open('/#contact', '_blank')} />
                      <SettingsItem label="Terms and Privacy Policy" onClick={() => window.open('/#privacy', '_blank')} />
                  </SettingsSection>
              </div>
          ));
          default: return renderMainView();
      }
  };
  
  const renderSubView = (title: string, content: () => React.ReactNode) => (
      <>
          {renderHeader(title, () => {
              if (currentView.startsWith('account_')) {
                  setCurrentView('account');
              } else if (currentView === 'wallpaper') {
                  setCurrentView('chats');
              } else {
                  setCurrentView('main');
              }
          })}
          <div className="flex-1 overflow-y-auto bg-black custom-scrollbar">
              {content()}
          </div>
      </>
  );

  const renderMainView = () => (
      <>
          {renderHeader(t('settings.title'))}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black">
              {/* Profile Section */}
              <div 
                  className="flex items-center justify-between bg-[#2c2c2e] p-4 rounded-xl cursor-pointer active:bg-[#3a3a3c] transition-colors" 
                  onClick={() => setCurrentView('profile')}
              >
                  <div className="flex items-center gap-4">
                      <img src={currentUser.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-gray-600" />
                      <div>
                          <h2 className="text-[20px] font-bold text-white">{currentUser.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-400 text-[15px] line-clamp-1">{currentUser.about || "Available"}</span>
                              <div className="bg-[#3a3a3c] px-2 py-0.5 rounded-full border border-gray-600 text-[11px] text-gray-300 font-medium">Busy</div>
                          </div>
                      </div>
                  </div>
                  <div className="bg-[#3a3a3c] p-2 rounded-full border border-gray-600">
                      <QrCodeIcon className="w-5 h-5 text-white" />
                  </div>
              </div>

              <SettingsSection>
                  <SettingsItem icon={UserCircleIcon} label="Avatar" color="bg-[#5e5ce6]" onClick={() => setCurrentView('profile')} />
              </SettingsSection>
              <SettingsSection>
                  <SettingsItem icon={ListIcon} label="Lists" color="bg-[#30d158]" onClick={() => setCurrentView('lists')} />
                  <SettingsItem icon={MegaphoneIcon} label="Broadcast messages" color="bg-[#30d158]" onClick={() => setCurrentView('broadcast')} />
                  <SettingsItem icon={StarIcon} label="Starred" color="bg-[#ffd60a]" onClick={() => setCurrentView('starred')} />
                  <SettingsItem icon={LaptopIcon} label="Linked devices" color="bg-[#64d2ff]" onClick={() => setCurrentView('linked_devices')} />
              </SettingsSection>
              <SettingsSection>
                  <SettingsItem icon={KeyIcon} label="Account" color="bg-[#0a84ff]" onClick={() => setCurrentView('account')} />
                  <SettingsItem icon={LockClosedIcon} label="Privacy" color="bg-[#64d2ff]" onClick={() => setCurrentView('privacy')} />
                  <SettingsItem icon={ChatBubbleIcon} label="Chats" color="bg-[#30d158]" onClick={() => setCurrentView('chats')} />
                  <SettingsItem icon={BellIcon} label="Notifications" color="bg-[#ff453a]" onClick={() => setCurrentView('notifications')} />
                  <SettingsItem icon={DataIcon} label="Storage and data" color="bg-[#30d158]" onClick={() => setCurrentView('storage')} />
              </SettingsSection>
              <SettingsSection>
                  <SettingsItem icon={HelpIcon} label="Help and feedback" color="bg-gray-500" onClick={() => setCurrentView('help')} />
              </SettingsSection>

              <button 
                  onClick={onLogout}
                  className="w-full p-3 bg-[#2c2c2e] text-[#ff453a] font-medium rounded-xl active:bg-[#3a3a3c] transition-colors"
              >
                  Log Out
              </button>
              <div className="text-center text-gray-600 text-xs pt-2 pb-8">
                  <p>KuikChat for Web</p>
                  <p>Version 2.5.0</p>
              </div>
          </div>
      </>
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div 
        className="bg-black w-full md:max-w-md h-full md:h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {renderViewContent()}
      </div>
    </div>
  );
};

export default SettingsView;
