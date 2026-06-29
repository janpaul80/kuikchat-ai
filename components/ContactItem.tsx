
import React from 'react';
import { Chat } from '../types';

interface ContactItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ chat, isSelected, onClick }) => {
  const lastMessage = chat.messages[chat.messages.length - 1];
  
  let name: string;
  let avatar: string;
  let aboutStatus: string | undefined;

  switch (chat.type) {
    case 'group':
      name = chat.name;
      avatar = chat.avatar;
      break;
    case 'individual':
      name = chat.user.name;
      avatar = chat.user.avatar;
      // Check if about status is valid
      if (chat.user.about && (!chat.user.aboutExpiresAt || chat.user.aboutExpiresAt > Date.now())) {
          aboutStatus = chat.user.about;
      }
      break;
    case 'channel':
      name = chat.name;
      avatar = chat.avatar;
      break;
    default:
      name = "Unknown Chat";
      avatar = "";
      break;
  }

  const getLastMessagePreview = () => {
    if (!lastMessage) return '';
    if (lastMessage.type === 'system') {
        try { return decodeURIComponent(escape(atob(lastMessage.text || ''))); } catch { return lastMessage.text || 'System message'; }
    }

    // If there's text, decode and show it. It might be a caption for media.
    if (lastMessage.text) {
      try {
        return decodeURIComponent(escape(atob(lastMessage.text)));
      } catch (e) {
        return lastMessage.text; // Fallback for non-base64 text
      }
    }

    // If no text, but there is media, show media type.
    if (lastMessage.media) {
        if (lastMessage.media.type === 'image') return '📷 Photo';
        if (lastMessage.media.type === 'video') return '📹 Video';
        if (lastMessage.media.type === 'audio') return '🎤 Voice message';
        if (lastMessage.media.type === 'document') return '📄 Document';
        if (lastMessage.media.type === 'sticker') return 'Sticker';
        if (lastMessage.media.type === 'gif') return 'GIF';
        if (lastMessage.media.type === 'video_note') return '📹 Video Note';
    }
    
    return '';
  };
  
  return (
    <div
      className={`relative flex items-center p-3 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent group ${
        isSelected 
        ? 'bg-white/80 dark:bg-white/10 shadow-md border-white/40 dark:border-white/5 scale-[1.02]' 
        : 'hover:bg-white/40 dark:hover:bg-white/5 hover:shadow-sm'
      }`}
      onClick={() => onClick(chat.id)}
    >
      <div className="relative mr-4 flex-shrink-0">
          <img 
            src={avatar} 
            alt={name} 
            className={`w-12 h-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 ${isSelected ? 'ring-2 ring-kuik-accent ring-offset-2 dark:ring-offset-gray-800' : ''}`}
          />
          {aboutStatus && (
              <div className="absolute -top-3 -left-2 z-10 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-full px-2 py-0.5 shadow-sm max-w-[70px] animate-fade-in">
                  <p className="text-[10px] text-gray-600 dark:text-gray-300 truncate leading-tight font-medium">{aboutStatus}</p>
                  <div className="absolute bottom-0 right-2 w-1.5 h-1.5 bg-white/90 dark:bg-black/80 border-b border-r border-gray-200 dark:border-gray-600 transform rotate-45 translate-y-1/2"></div>
              </div>
          )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className={`text-base font-bold truncate ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>{name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{lastMessage?.timestamp}</p>
        </div>
        <p className={`text-sm truncate ${isSelected ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            {getLastMessagePreview()}
        </p>
      </div>
    </div>
  );
};

export default ContactItem;
