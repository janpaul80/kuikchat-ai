
import React, { useEffect, useRef, useState } from 'react';
import { Chat, User, Media, GroupChat, Message, ReplyInfo, TextEffect } from '../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import MediaGallery from './MediaGallery';
import EncryptionNotice from './EncryptionNotice';
import SystemMessage from './SystemMessage';
import DisappearingMessagesModal from './DisappearingMessagesModal';
import { VideoCameraIcon, PhoneIcon, SearchIcon, PhotoIcon, CloseIcon, ChevronUpIcon, ChevronDownIcon, LockClosedIcon, CheckCircleIcon, SettingsIcon, EyeIcon, EyeSlashIcon, CameraIcon, ChevronLeftIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText } from '../services/geminiService';
import ContextMenu from './ContextMenu';

interface VerificationModalProps {
  user: User;
  onClose: () => void;
  onVerify: () => void;
}

// Generate a mock security number string
const generateSecurityNumber = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }

  const groups = [];
  let seed = Math.abs(hash);
  for (let i = 0; i < 8; i++) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    groups.push((seed % 100000).toString().padStart(5, '0'));
  }
  return groups.join(' ');
};

const VerificationModal: React.FC<VerificationModalProps> = ({ user, onClose, onVerify }) => {
    const { t } = useLanguage();
    const securityNumber = generateSecurityNumber(user.id);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=kuikchat-verify:${user.id}:${securityNumber}&color=075E54&bgcolor=ffffff&qzone=1`;

    return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
        className="bg-white dark:bg-kuik-dark-panel rounded-lg shadow-2xl w-full max-w-md flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-kuik-dark-text-primary">{t('verificationModal.title')}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-header">
            <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
            </button>
        </header>

        <div className="p-6 text-center">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200 dark:border-gray-600"/>
            <p className="text-gray-600 dark:text-kuik-dark-text-secondary mb-4">
                {t('verificationModal.description', { contactName: user.name })}
            </p>

            <div className="p-4 bg-white rounded-lg shadow-md inline-block my-4">
                <img src={qrCodeUrl} alt="Verification QR Code" width="192" height="192" />
            </div>
            
            <div className="font-mono text-lg tracking-widest text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-kuik-dark-header p-4 rounded-lg">
                {securityNumber}
            </div>
        </div>

        <footer className="p-4 bg-gray-50 dark:bg-kuik-dark-header border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
                {t('verificationModal.cancel')}
            </button>
            <button 
                onClick={() => { onVerify(); onClose(); }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-kuik-accent text-white font-semibold rounded-lg hover:bg-kuik-green transition-colors"
            >
                <LockClosedIcon className="w-5 h-5" />
                <span>{t('verificationModal.verify')}</span>
            </button>
        </footer>
        </div>
    </div>
    );
};

interface ChatWindowProps {
  chat: Chat | undefined;
  chatWallpaper?: string;
  onSendMessage: (chatId: string, message: string, effect?: TextEffect) => void;
  onSendMedia: (chatId: string, media: Media) => void;
  onAiGenerate: (chatId: string, prompt: string, mode: 'ask' | 'art') => void;
  onReaction: (chatId: string, messageId: string, emoji: string) => void;
  onDeleteMessage: (chatId: string, messageId: string) => void;
  onStartCall: (chatId: string, type: 'voice' | 'video') => void;
  onOpenGroupInfo: (chatId: string) => void;
  currentUser: User;
  allUsers: User[];
  isTyping: boolean;
  onSetReplyTo: (message: Message) => void;
  onCancelReply: () => void;
  replyToMessage: Message | null;
  onVerifyContact: (userId: string) => void;
  onForwardMessage: (message: Message) => void;
  onOpenEventCreator: () => void;
  onOpenDocumentScanner: () => void;
  onOpenScheduleMessage: () => void;
  onTranscribeAudio: (chatId: string, message: Message) => void;
  onPinMessage: (chatId: string, messageId: string) => void;
  onUnpinMessage: (chatId: string, messageId: string) => void;
  onToggleVanishMode: (chatId: string) => void;
  onChangeTheme: (chatId: string, theme: string) => void;
  onScreenshot: (chatId: string) => void;
  onBack: () => void;
}

const WelcomeScreen: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="relative flex flex-col items-center justify-center h-full text-center bg-transparent p-8">
            <div className="mb-6 p-6 bg-white/50 dark:bg-slate-800/50 rounded-full shadow-xl backdrop-blur-sm">
                <svg width="128" height="128" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                    <path d="M128 234.667C186.983 234.667 234.667 186.983 234.667 128C234.667 69.0173 186.983 21.3333 128 21.3333C69.0173 21.3333 21.3333 69.0173 21.3333 128C21.3333 186.983 69.0173 234.667 128 234.667Z" stroke="#B0B0B0" strokeWidth="8" strokeMiterlimit="10"/>
                    <path d="M96 101.333C105.891 101.333 114 93.224 114 83.3333C114 73.4427 105.891 65.3333 96 65.3333C86.1093 65.3333 78 73.4427 78 83.3333C78 93.224 86.1093 101.333 96 101.333Z" fill="#2563eb"/>
                    <path d="M160 101.333C169.891 101.333 178 93.224 178 83.3333C178 73.4427 169.891 65.3333 160 65.3333C150.109 65.3333 142 73.4427 142 83.3333C142 93.224 150.109 101.333 160 101.333Z" fill="#22c55e"/>
                    <path d="M178.667 154.667C178.667 182.476 156.476 204.667 128.667 204.667C100.857 204.667 78.6667 182.476 78.6667 154.667C78.6667 150.019 79.5444 145.54 81.1667 141.333C81.1667 141.333 86.6667 136 96 136C105.333 136 109.333 141.333 109.333 141.333C114.667 146.667 142.667 146.667 148 141.333C148 141.333 152 136 161.333 136C170.667 136 176.167 141.333 176.167 141.333C177.789 145.54 178.667 150.019 178.667 154.667Z" fill="#B0B0B0"/>
                </svg>
            </div>
            <h2 className="text-3xl font-light text-slate-700 dark:text-slate-200">{t('chatWindow.welcomeTitle')}</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-md">
                {t('chatWindow.welcomeMessage')}
            </p>
        </div>
    );
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  chatWallpaper,
  onSendMessage,
  onSendMedia,
  onAiGenerate,
  onReaction,
  onDeleteMessage,
  onStartCall,
  onOpenGroupInfo,
  currentUser,
  allUsers,
  isTyping,
  onSetReplyTo,
  onCancelReply,
  replyToMessage,
  onVerifyContact,
  onForwardMessage,
  onOpenEventCreator,
  onOpenDocumentScanner,
  onOpenScheduleMessage,
  onTranscribeAudio,
  onPinMessage,
  onUnpinMessage,
  onToggleVanishMode,
  onChangeTheme,
  onScreenshot,
  onBack
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const { t } = useLanguage();

  const chatOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatOptionsRef.current && !chatOptionsRef.current.contains(event.target as Node)) {
        setShowChatOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);
  
  useEffect(() => {
    if (searchQuery) {
        const results = chat?.messages
            .filter(m => m.text && atob(m.text).toLowerCase().includes(searchQuery.toLowerCase()))
            .map(m => m.id) || [];
        setSearchResults(results);
        setCurrentResultIndex(0);
    } else {
        setSearchResults([]);
    }
  }, [searchQuery, chat?.messages]);

  const handleTranslateMessage = async (message: Message) => {
    if (translations[message.id]) return; // Already translated
    try {
        const textToTranslate = decodeURIComponent(escape(atob(message.text || '')));
        const translatedText = await translateText(textToTranslate, 'en');
        setTranslations(prev => ({ ...prev, [message.id]: translatedText }));
    } catch (e) {
        setTranslations(prev => ({ ...prev, [message.id]: "Translation failed." }));
    }
  };

  const handleSelectMessage = (message: Message) => {
      setSelectionMode(true);
      setSelectedMessages(prev => 
          prev.includes(message.id) 
              ? prev.filter(id => id !== message.id)
              : [...prev, message.id]
      );
  };
  
  const handleDeselectAll = () => {
      setSelectionMode(false);
      setSelectedMessages([]);
  };

  if (!chat) return <WelcomeScreen />;

  const mediaItems: Media[] = chat.messages
    .filter(m => m.media && (m.media.type === 'image' || m.media.type === 'video'))
    .map(m => m.media as Media);

  const name = chat.type === 'individual' ? chat.user.name : chat.name;
  const avatar = chat.type === 'individual' ? chat.user.avatar : chat.avatar;
  const statusText = chat.type === 'individual' ? (isTyping ? t('chatWindow.typing') : (chat.user.isBot ? 'AI Assistant' : t('chatWindow.online'))) : `${(chat as GroupChat).participants.length} ${t('chatWindow.participants')}`;
  const isVerified = chat.type === 'individual' ? chat.user.isVerified : false;
  const isIndividualNonBot = chat.type === 'individual' && !chat.user.isBot;
  
  const handleScrollToMessage = (messageId: string) => {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };

  const currentMatchId = searchResults[currentResultIndex];

  return (
    <>
      <div className={`flex flex-col h-full relative ${chat.theme || ''}`}>
        <header className="flex-shrink-0 flex items-center justify-between p-3 bg-white/60 dark:bg-[#1e293b]/60 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 z-20">
          <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 mr-2 md:hidden text-slate-600 dark:text-slate-300 hover:bg-black/10 rounded-full">
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full mr-3 cursor-pointer" onClick={() => chat.type === 'group' && onOpenGroupInfo(chat.id)}/>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{statusText}</p>
            </div>
            {isIndividualNonBot && (
                <div 
                    className="ml-2 cursor-pointer" 
                    title={isVerified ? t('chatWindow.verifiedTooltip') : t('chatWindow.unverifiedTooltip')}
                    onClick={() => setShowVerificationModal(true)}
                >
                    <LockClosedIcon className={`w-4 h-4 ${isVerified ? 'text-kuik-accent' : 'text-gray-400'}`} />
                </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => onStartCall(chat.id, 'video')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-black/10 rounded-full" title={t('chatWindow.startVideoCall')}><VideoCameraIcon className="w-5 h-5"/></button>
            <button onClick={() => onStartCall(chat.id, 'voice')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-black/10 rounded-full" title={t('chatWindow.startVoiceCall')}><PhoneIcon className="w-5 h-5"/></button>
            <button onClick={() => setShowSearch(s => !s)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-black/10 rounded-full" title={t('chatWindow.searchMessages')}><SearchIcon className="w-5 h-5"/></button>
            <div className="relative" ref={chatOptionsRef}>
                <button onClick={() => setShowChatOptions(p => !p)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-black/10 rounded-full">
                    <SettingsIcon className="w-5 h-5"/>
                </button>
                 {showChatOptions && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-kuik-dark-panel rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in-fast p-2">
                         <button onClick={() => { setIsGalleryOpen(true); setShowChatOptions(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Media Gallery</button>
                         <button onClick={() => { setShowDisappearingModal(true); setShowChatOptions(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Disappearing Messages</button>
                         <button onClick={() => { onToggleVanishMode(chat.id); setShowChatOptions(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Toggle Vanish Mode</button>
                    </div>
                 )}
            </div>
          </div>
        </header>

        {showSearch && (
            <div className="flex items-center p-2 bg-kuik-panel-header dark:bg-kuik-dark-header border-b border-gray-200 dark:border-gray-700 z-10">
                <input 
                    type="text" 
                    placeholder={t('chatWindow.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 bg-gray-200 dark:bg-kuik-dark-panel rounded-lg px-3 py-1.5 text-sm"
                    autoFocus
                />
                 {searchResults.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mx-2">
                        <span>{currentResultIndex + 1} {t('chatWindow.of')} {searchResults.length}</span>
                        <button onClick={() => setCurrentResultIndex(i => (i-1+searchResults.length) % searchResults.length)} className="p-1"><ChevronUpIcon className="w-4 h-4"/></button>
                        <button onClick={() => setCurrentResultIndex(i => (i+1) % searchResults.length)} className="p-1"><ChevronDownIcon className="w-4 h-4"/></button>
                    </div>
                )}
                <button onClick={() => setShowSearch(false)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-panel"><CloseIcon className="w-5 h-5"/></button>
            </div>
        )}
        
        {chat.isVanishMode && (
             <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-center border-b border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{t('chatWindow.vanishModeOn')}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">{t('chatWindow.vanishModeDescription')}</p>
            </div>
        )}

        <div 
          className="flex-1 overflow-y-auto custom-scrollbar relative"
          style={chatWallpaper ? { backgroundImage: `url(${chatWallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className={`absolute inset-0 bg-black/10 dark:bg-black/30 ${chatWallpaper ? '' : 'hidden'}`}></div>
          <div className="p-4 space-y-4 relative">
            <EncryptionNotice />
            {chat.messages.map((message) => {
              if (message.type === 'system') {
                try {
                  const text = decodeURIComponent(escape(atob(message.text || '')));
                  return <SystemMessage key={message.id} text={text} />;
                } catch {
                  return <SystemMessage key={message.id} text={message.text || ''} />;
                }
              }
              const isOwn = message.senderId === currentUser.id;
              const sender = allUsers.find(u => u.id === message.senderId);
              return (
                <div key={message.id} id={`message-${message.id}`}>
                  <MessageBubble
                    message={message}
                    isOwnMessage={isOwn}
                    sender={sender}
                    isGroupChat={chat.type === 'group'}
                    chatType={chat.type}
                    onReaction={(emoji) => onReaction(chat.id, message.id, emoji)}
                    currentUser={currentUser}
                    onDelete={(messageId) => onDeleteMessage(chat.id, messageId)}
                    highlightQuery={searchQuery}
                    isCurrentMatch={message.id === currentMatchId}
                    isDisappearing={!!message.disappearsAt}
                    onReply={onSetReplyTo}
                    onScrollToMessage={handleScrollToMessage}
                    onForward={onForwardMessage}
                    onTranslate={handleTranslateMessage}
                    onReport={() => alert('Reported')}
                    onSelect={handleSelectMessage}
                    onTranscribe={(msg) => onTranscribeAudio(chat.id, msg)}
                    onPin={() => onPinMessage(chat.id, message.id)}
                    onUnpin={() => onUnpinMessage(chat.id, message.id)}
                    isPinned={chat.pinnedMessages?.includes(message.id)}
                    isSelectionMode={selectionMode}
                    isSelected={selectedMessages.includes(message.id)}
                    translation={translations[message.id]}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <ChatInput 
          onSendMessage={(msg, effect) => onSendMessage(chat.id, msg, effect)}
          onSendMedia={(media) => onSendMedia(chat.id, media)}
          onStartVideoCall={() => onStartCall(chat.id, 'video')}
          onAiGenerate={(prompt, mode) => onAiGenerate(chat.id, prompt, mode)}
          isSending={isTyping}
          disabledReason={chat.type === 'group' && (chat as GroupChat).permissions.sendMessages === 'admins' && !(chat as GroupChat).admins.includes(currentUser.id) ? t('chatInput.placeholderDisabled') : null}
          replyToMessage={replyToMessage}
          onCancelReply={onCancelReply}
          allUsers={allUsers}
          onOpenEventCreator={onOpenEventCreator}
          onOpenDocumentScanner={onOpenDocumentScanner}
          onOpenScheduleMessage={onOpenScheduleMessage}
        />
      </div>

      {isGalleryOpen && <MediaGallery mediaItems={mediaItems} onClose={() => setIsGalleryOpen(false)} />}
      {showDisappearingModal && <DisappearingMessagesModal onClose={() => setShowDisappearingModal(false)} onSetTimer={()=>{}} currentTimer={0} />}
      {showVerificationModal && isIndividualNonBot && <VerificationModal user={(chat as any).user} onClose={() => setShowVerificationModal(false)} onVerify={() => onVerifyContact((chat as any).user.id)} />}
    </>
  );
};

export default ChatWindow;
