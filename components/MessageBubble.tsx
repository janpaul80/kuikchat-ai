import React, { useState, forwardRef, useRef, useEffect } from 'react';
import { Message, User } from '../types';
import { 
    CheckIcon, DoubleCheckIcon, TimerIcon, DocumentIcon, 
    ReplyIcon, CopyIcon, TranslateIcon, LinkIcon, ForwardIcon, 
    FlagIcon, CheckCircleIcon, ChevronDownIcon, TrashIcon, CalendarIcon, TranscribeIcon
} from './icons';
import AudioPlayer from './AudioPlayer';
import { useLanguage } from '../contexts/LanguageContext';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  sender?: User;
  isGroupChat: boolean;
  chatType?: string; 
  onReaction: (emoji: string) => void;
  currentUser: User;
  onDelete: (messageId: string) => void;
  highlightQuery?: string;
  isCurrentMatch?: boolean;
  isDisappearing?: boolean;
  onReply: (message: Message) => void;
  onScrollToMessage: (messageId: string) => void;
  onForward?: (message: Message) => void;
  onTranslate?: (message: Message) => void;
  onReport?: (message: Message) => void;
  onSelect?: (message: Message) => void;
  onTranscribe?: (message: Message) => void;
  onPin?: (message: Message) => void;
  onUnpin?: (message: Message) => void;
  isPinned?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  translation?: string;
}

const nameToColor = (name: string) => {
    let hash = 0;
    if (name.length === 0) return 'hsl(0, 0%, 50%)';
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 40%)`;
};

const COMMON_REACTIONS = ['🕊️', '❤️', '👍', '👎', '🔥', '🥰', '👏'];

const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(({ 
    message, 
    isOwnMessage, 
    sender, 
    isGroupChat, 
    chatType,
    onReaction, 
    currentUser, 
    onDelete, 
    highlightQuery, 
    isCurrentMatch,
    isDisappearing,
    onReply,
    onScrollToMessage,
    onForward,
    onTranslate,
    onReport,
    onSelect,
    onTranscribe,
    onPin,
    onUnpin,
    isPinned,
    isSelected = false,
    isSelectionMode = false,
    translation
}, ref) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!message.isBot && !isSelectionMode) {
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setShowMenu(true);
    }
  };

  const handleChevronClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.target as Element).getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setShowMenu(!showMenu);
  };

  const handleAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
        case 'reply':
            onReply(message);
            break;
        case 'copy':
            if (message.text) {
                try {
                    const decoded = decodeURIComponent(escape(atob(message.text)));
                    navigator.clipboard.writeText(decoded);
                } catch {
                    navigator.clipboard.writeText(message.text);
                }
            }
            break;
        case 'translate':
            onTranslate?.(message);
            break;
        case 'transcribe':
            onTranscribe?.(message);
            break;
        case 'copyLink':
            const link = `${window.location.origin}/message/${message.id}`;
            navigator.clipboard.writeText(link);
            alert("Link copied to clipboard: " + link);
            break;
        case 'forward':
            onForward?.(message);
            break;
        case 'report':
            onReport?.(message);
            break;
        case 'select':
            onSelect?.(message);
            break;
        case 'delete':
            onDelete(message.id);
            break;
        case 'pin':
            onPin?.(message);
            break;
        case 'unpin':
            onUnpin?.(message);
            break;
        default:
            break;
    }
  };
  
  const handleEmojiClick = (emoji: string) => {
      onReaction(emoji);
      setShowMenu(false);
  }

  const getStatusIcon = () => {
    if (!isOwnMessage || message.isBot) return null;

    switch (message.status) {
      case 'read':
        return <span title="Read"><DoubleCheckIcon className="w-3.5 h-3.5 text-blue-500" /></span>;
      case 'delivered':
        return <span title="Delivered"><DoubleCheckIcon className="w-3.5 h-3.5 text-gray-500 dark:text-kuik-dark-text-secondary" /></span>;
      case 'sent':
      default:
        return <span title="Sent"><CheckIcon className="w-3.5 h-3.5 text-gray-500 dark:text-kuik-dark-text-secondary" /></span>;
    }
  };
  
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
  }

  const renderHighlightedText = (text: string, query?: string) => {
    if (!query || query.trim() === '') {
      return text;
    }
    const escapedQuery = escapeRegExp(query);
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-300 dark:bg-yellow-500 rounded px-0.5 text-black">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const getDecodedText = (text?: string): string => {
    if (!text) return '';
    try {
        return decodeURIComponent(escape(atob(text)));
    } catch {
        return text;
    }
  }

  const getEffectClass = (effect?: string) => {
      switch (effect) {
          case 'big': return 'text-3xl font-bold leading-tight';
          case 'small': return 'text-[10px] leading-tight';
          case 'shake': return 'animate-shake inline-block';
          case 'nod': return 'animate-nod inline-block';
          case 'explode': return 'animate-explode inline-block';
          case 'ripple': return 'animate-ripple inline-block';
          case 'bloom': return 'animate-bloom';
          case 'jitter': return 'animate-jitter inline-block';
          default: return '';
      }
  }

  const senderName = isGroupChat && !isOwnMessage && sender ? sender.name : null;
  const nameColor = sender?.profileColor || (senderName ? nameToColor(sender.id) : '');
  const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;
  const { statusReply, replyTo } = message;
  const replyHeader = statusReply 
    ? (isOwnMessage 
        ? `Replied to ${statusReply.senderName === 'You' ? 'your status' : `${statusReply.senderName}'s status`}`
        : "Replied to your status")
    : "";
  const isSticker = message.media?.type === 'sticker';
  const isVideoNote = message.media?.type === 'video_note';
  const isAudio = message.media?.type === 'audio';
  const showTranscribeOption = isAudio && chatType === 'channel';

  const renderMenu = () => {
      if (!menuPosition) return null;
      
      let left = menuPosition.x;
      let top = menuPosition.y;
      const menuWidth = 220;
      const menuHeight = 350;

      if (left + menuWidth > window.innerWidth) {
          left = window.innerWidth - menuWidth - 10;
      }
      if (top + menuHeight > window.innerHeight) {
          top = menuPosition.y - menuHeight;
      }

      return (
        <div 
            ref={menuRef}
            className="fixed z-50 bg-[#2D2D2D] text-[#EAEAEA] rounded-lg shadow-2xl py-2 w-[220px] animate-fade-in border border-[#1E1E1E]"
            style={{ top, left }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-3 py-2 flex justify-between items-center mb-1">
                {COMMON_REACTIONS.map(emoji => (
                    <button 
                        key={emoji} 
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl hover:scale-125 transition-transform"
                    >
                        {emoji}
                    </button>
                ))}
                <button className="text-gray-400 hover:text-white ml-1">
                     <ChevronDownIcon className="w-4 h-4"/>
                </button>
            </div>
            
            <div className="h-px bg-gray-700 my-1 mx-0" />

            <ul className="text-sm">
                <li>
                    <button onClick={() => handleAction('reply')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                        <ReplyIcon className="w-5 h-5 text-gray-400" />
                        <span>Reply</span>
                    </button>
                </li>
                <li>
                    <button onClick={() => handleAction('copy')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                        <CopyIcon className="w-5 h-5 text-gray-400" />
                        <span>Copy</span>
                    </button>
                </li>
                 <li>
                    <button onClick={() => handleAction(isPinned ? 'unpin' : 'pin')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                        <div className="w-5 h-5 text-gray-400 flex items-center justify-center font-bold text-lg" style={{ transform: 'rotate(45deg)' }}>📌</div>
                        <span>{isPinned ? t('messageActions.unpin') : t('messageActions.pin')}</span>
                    </button>
                </li>
                 <li>
                    <button onClick={() => handleAction('translate')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                        <TranslateIcon className="w-5 h-5 text-gray-400" />
                        <span>Translate</span>
                    </button>
                </li>
                {showTranscribeOption && (
                     <li>
                        <button onClick={() => handleAction('transcribe')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                            <TranscribeIcon className="w-5 h-5 text-gray-400" />
                            <span>{t('messageActions.transcribe')}</span>
                        </button>
                    </li>
                )}
                 <li>
                    <button onClick={() => handleAction('copyLink')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-gray-400" />
                        <span>Copy Message Link</span>
                    </button>
                </li>
                <li>
                    <button onClick={() => handleAction('forward')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                        <ForwardIcon className="w-5 h-5 text-gray-400" />
                        <span>Forward</span>
                    </button>
                </li>
                 <li>
                    <button onClick={() => handleAction('report')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                        <FlagIcon className="w-5 h-5 text-gray-400" />
                        <span>Report</span>
                    </button>
                </li>
                 <li>
                    <button onClick={() => handleAction('select')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                        <span>Select</span>
                    </button>
                </li>
                {isOwnMessage && (
                    <li>
                        <button onClick={() => handleAction('delete')} className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] flex items-center gap-3 text-red-400">
                             <TrashIcon className="w-5 h-5" />
                             <span>Delete</span>
                        </button>
                    </li>
                )}
            </ul>
        </div>
      );
  }

  const bubbleClasses = `relative rounded-lg w-full ${isOwnMessage ? 'bg-kuik-outgoing-msg dark:bg-kuik-dark-outgoing-msg' : 'bg-kuik-incoming-msg dark:bg-kuik-dark-incoming-msg'} ${hasReactions ? (isOwnMessage ? 'mb-2' : 'mb-2') : ''} ${isSticker || isVideoNote ? 'p-0 bg-transparent shadow-none dark:bg-transparent' : 'px-3 py-2 shadow-sm'}`;

  return (
    <div ref={ref} className={`flex w-full mb-1 ${isSelectionMode ? 'items-center gap-3' : ''}`}>
      {isSelectionMode && (
         <div onClick={() => onSelect?.(message)} className="flex-shrink-0 cursor-pointer">
             <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-kuik-accent border-kuik-accent' : 'border-gray-400 bg-transparent'}`}>
                 {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
             </div>
         </div>
      )}
      <div className={`flex flex-col w-full transition-colors duration-300 ${isOwnMessage ? 'items-end' : 'items-start'} ${isCurrentMatch ? 'bg-blue-100 dark:bg-blue-900/30 rounded-lg p-1 -m-1' : ''}`}>
        <div 
          className="group relative max-w-sm md:max-w-md lg:max-w-lg"
          onContextMenu={handleContextMenu}
          ref={bubbleRef}
        >
          
          {!isSticker && !isVideoNote && !isSelectionMode && (
              <button
                  onClick={handleChevronClick}
                  className={`absolute top-0 z-20 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                    ${isOwnMessage ? 'right-0 bg-kuik-outgoing-msg dark:bg-kuik-dark-outgoing-msg' : 'right-0 bg-kuik-incoming-msg dark:bg-kuik-dark-incoming-msg'} 
                    rounded-bl-lg shadow-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`}
                  style={{ borderTopRightRadius: '0.5rem' }}
              >
                  <ChevronDownIcon className="w-5 h-5" />
              </button>
          )}

          <div className={bubbleClasses}>
            {senderName && !isSticker && !isVideoNote && (
                <p className="text-sm font-bold mb-1" style={{ color: nameColor }}>
                    {senderName}
                </p>
            )}
            {statusReply && !isSticker && !isVideoNote && (
              <div className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 border-l-4 border-kuik-accent/50 opacity-80">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {replyHeader}
                </p>
                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 overflow-hidden">
                  {statusReply.type === 'image' && <img src={statusReply.content} alt="status preview" className="w-10 h-10 object-cover rounded mr-2" />}
                  {statusReply.type === 'video' && <video src={statusReply.content} className="w-10 h-10 object-cover rounded mr-2" />}
                  {statusReply.type === 'text' 
                    ? <p className="truncate">{statusReply.content}</p> 
                    : <p className="truncate">{statusReply.caption || (statusReply.type === 'image' ? 'Image' : 'Video')}</p>
                  }
                </div>
              </div>
            )}
            {replyTo && !isSticker && !isVideoNote && (
              <div 
                className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 border-l-4 border-kuik-accent/50 opacity-80 cursor-pointer"
                onClick={() => onScrollToMessage(replyTo.messageId)}
                title="Go to original message"
              >
                <p className="text-sm font-bold text-kuik-accent">{replyTo.senderName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {replyTo.text 
                      ? getDecodedText(replyTo.text) 
                      : replyTo.media?.fileName || replyTo.media?.type || 'Media'
                  }
                </p>
              </div>
            )}

            {message.event && (
                <div className="mb-2 p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start gap-3">
                         <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{message.event.title}</h4>
                            {message.event.description && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{message.event.description}</p>}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{message.event.date} • {message.event.time}</p>
                             {message.event.location && <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate">{message.event.location}</p>}
                        </div>
                    </div>
                </div>
            )}

            {message.media && (
                <div className={`mb-1 ${isSticker ? 'w-32' : 'max-w-full'}`}>
                    {message.media.type === 'image' && (
                        <img src={message.media.url} alt="media" className="rounded-lg w-full h-auto object-cover max-h-80" />
                    )}
                    {message.media.type === 'video' && (
                        <video src={message.media.url} controls className="rounded-lg w-full h-auto max-h-80" />
                    )}
                    {message.media.type === 'video_note' && (
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                             <video src={message.media.url} autoPlay muted loop className="w-full h-full object-cover" />
                        </div>
                    )}
                    {message.media.type === 'sticker' && (
                         <img src={message.media.url} alt="sticker" className="w-full h-full object-contain" />
                    )}
                    {message.media.type === 'gif' && (
                         <img src={message.media.url} alt="gif" className="rounded-lg w-full h-auto object-cover" />
                    )}
                    {message.media.type === 'audio' && (
                        <AudioPlayer url={message.media.url} />
                    )}
                     {message.media.type === 'document' && (
                        <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-white/10 rounded-lg">
                            <DocumentIcon className="w-8 h-8 text-red-500" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate text-gray-800 dark:text-gray-200">{message.media.fileName || 'Document'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{message.media.fileSize || 'Unknown size'}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {message.text && (
                 <div className={`relative whitespace-pre-wrap break-words text-sm md:text-base ${getEffectClass(message.textEffect)} ${isOwnMessage ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                    {renderHighlightedText(getDecodedText(message.text), highlightQuery)}
                     {translation && (
                         <div className="mt-2 pt-2 border-t border-white/20 text-sm italic opacity-90">
                             <p className="font-bold text-xs uppercase mb-0.5">Translation:</p>
                             {translation}
                         </div>
                     )}
                     {message.transcript && (
                          <div className="mt-2 pt-2 border-t border-white/20 text-sm italic opacity-90">
                             <p className="font-bold text-xs uppercase mb-0.5">Transcript:</p>
                             {message.transcript}
                         </div>
                     )}
                </div>
            )}

            <div className={`flex items-center justify-end gap-1 mt-1 select-none ${isSticker || isVideoNote ? 'bg-black/30 rounded-full px-2 py-0.5 inline-flex' : ''}`}>
                 {isPinned && <div className="text-[10px] mr-1">📌</div>}
                 {isDisappearing && <TimerIcon className={`w-3 h-3 ${isOwnMessage || isSticker || isVideoNote ? 'text-white/70' : 'text-gray-400'}`} />}
                 <span className={`text-[10px] ${isOwnMessage || isSticker || isVideoNote ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {message.timestamp}
                 </span>
                 {getStatusIcon()}
            </div>
          </div>

           {hasReactions && (
                <div className={`absolute -bottom-3 ${isOwnMessage ? 'right-2' : 'left-2'} flex items-center gap-1`}>
                    {Object.entries(message.reactions || {}).map(([emoji, users]) => (
                        <div key={emoji} className="bg-white dark:bg-gray-700 rounded-full px-1.5 py-0.5 text-xs shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-1 cursor-pointer" onClick={() => onReaction(emoji)}>
                            <span>{emoji}</span>
                            <span className="text-gray-500 dark:text-gray-300 font-medium">{(users as string[]).length}</span>
                        </div>
                    ))}
                </div>
           )}
        </div>
      </div>
      
      {showMenu && renderMenu()}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;