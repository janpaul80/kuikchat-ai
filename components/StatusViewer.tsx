import React, { useState, useEffect, useRef } from 'react';
import { UserStatus, StatusItem } from '../types';
import { CloseIcon, SendIcon } from './icons';

interface StatusViewerProps {
  userStatus: UserStatus;
  onClose: () => void;
  onReply: (replyText: string, repliedToItem: StatusItem) => void;
}

const StatusViewer: React.FC<StatusViewerProps> = ({ userStatus, onClose, onReply }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = userStatus.items[currentIndex];

  const goToNext = () => {
    if (currentIndex < userStatus.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  useEffect(() => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
    }

    if (!currentItem || isPaused) return;

    if (currentItem.type === 'image' || currentItem.type === 'text') {
        timerRef.current = window.setTimeout(goToNext, currentItem.duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isPaused, userStatus]);

  useEffect(() => {
    if (videoRef.current) {
        if (isPaused) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(e => console.error("Video play failed:", e));
        }
    }
  }, [isPaused]);

  const handleMouseDown = () => setIsPaused(true);
  const handleMouseUp = () => setIsPaused(false);

  const handleNavigationClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const { clientX, currentTarget } = e;
      const { left, width } = currentTarget.getBoundingClientRect();
      const clickPosition = clientX - left;
      
      if (clickPosition < width / 3) {
          goToPrev();
      } else {
          goToNext();
      }
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (replyText.trim() && currentItem) {
        onReply(replyText.trim(), currentItem);
        setReplyText('');
    }
  };

  const renderContent = () => {
    if (!currentItem) return null;
    switch (currentItem.type) {
      case 'image':
        return <img src={currentItem.content} alt={currentItem.caption || 'Status Image'} className="max-h-full max-w-full object-contain" />;
      case 'video':
        return <video ref={videoRef} src={currentItem.content} className="max-h-full max-w-full object-contain" autoPlay onEnded={goToNext} />;
      case 'text':
        return (
          <div className={`w-full h-full flex items-center justify-center p-8 ${currentItem.backgroundColor}`}>
            <p className="text-white text-4xl font-bold text-center">{currentItem.content}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!currentItem) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="absolute top-0 left-0 right-0 p-4 z-20">
            <div className="flex items-center space-x-1">
                {userStatus.items.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full">
                         <div
                            className={`h-full rounded-full ${index === currentIndex ? 'bg-white' : ''} ${index < currentIndex ? 'bg-white' : ''}`}
                            style={{
                                width: index < currentIndex ? '100%' : (index === currentIndex ? '100%' : '0%'),
                                transition: index === currentIndex && !isPaused && currentItem.type !== 'video' ? `width ${currentItem.duration}ms linear` : 'none'
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mt-3">
                 <div className="flex items-center">
                    <img src={userStatus.userAvatar} alt={userStatus.userName} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <p className="text-white font-semibold">{userStatus.userName}</p>
                    </div>
                 </div>
                <button onClick={onClose} className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-20">
                    <CloseIcon className="w-7 h-7" />
                </button>
            </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-full h-full" onClick={handleNavigationClick}/>
            <div className="max-h-[80vh] max-w-[90vw] relative">
                {renderContent()}
                {currentItem.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 text-center">
                        <p className="text-white text-lg">{currentItem.caption}</p>
                    </div>
                )}
            </div>
        </div>

         {userStatus.userId !== 'user-1' && (
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/50 to-transparent">
                <form onSubmit={handleSubmitReply} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${userStatus.userName}...`}
                        className="flex-1 p-3 rounded-full bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                    />
                    <button
                        type="submit"
                        className="bg-kuik-accent text-white p-3 rounded-full hover:bg-kuik-green transition-colors disabled:opacity-50"
                        disabled={!replyText.trim()}
                        aria-label="Send reply"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        )}
    </div>
  );
};

export default StatusViewer;