import React, { useState } from 'react';
import { StatusItem } from '../types';
import { CloseIcon, SendIcon } from './icons';

interface StatusCreatorProps {
  onClose: () => void;
  onCreateStatus: (item: Omit<StatusItem, 'id' | 'timestamp'>) => void;
}

const TEXT_COLORS = [
    'bg-gray-800', 'bg-red-600', 'bg-yellow-500', 'bg-green-600',
    'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600'
];

const StatusCreator: React.FC<StatusCreatorProps> = ({ onClose, onCreateStatus }) => {
  const [statusType, setStatusType] = useState<'text' | 'image' | 'video' | null>(null);
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('bg-gray-800');

  const handlePost = () => {
    if (statusType === 'text' && text.trim()) {
      onCreateStatus({ type: 'text', content: text, backgroundColor, duration: 5000 });
    } else if (statusType === 'image') {
      onCreateStatus({ 
          type: 'image', 
          content: `https://picsum.photos/id/${Math.floor(Math.random() * 200)}/1080/1920`,
          caption,
          duration: 5000
      });
    } else if (statusType === 'video') {
       onCreateStatus({
           type: 'video',
           content: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
           caption,
           duration: 60000 // Placeholder, actual duration would be from video file
       });
    }
  };

  const renderContent = () => {
    if (statusType === 'text') {
      return (
        <div className="w-full h-full flex flex-col">
          <div className={`flex-1 flex items-center justify-center p-4 ${backgroundColor} transition-colors`}>
            <textarea
              placeholder="Type a status"
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-transparent text-white text-4xl font-bold text-center resize-none outline-none"
              rows={4}
            />
          </div>
          <div className="p-2 bg-white dark:bg-kuik-dark-panel flex items-center justify-center space-x-2">
            {TEXT_COLORS.map(color => (
              <button key={color} onClick={() => setBackgroundColor(color)} className={`w-8 h-8 rounded-full ${color} ${backgroundColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`} />
            ))}
          </div>
        </div>
      );
    }
    if (statusType === 'image' || statusType === 'video') {
        return (
            <div className="w-full h-full flex flex-col bg-black">
                <div className="flex-1 flex items-center justify-center">
                    {statusType === 'image' && <img src={`https://picsum.photos/id/101/1080/1920`} alt="Status preview" className="max-h-full object-contain" />}
                    {statusType === 'video' && <video src='https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' controls className="max-h-full" />}
                </div>
                 <input
                    type="text"
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full p-3 bg-gray-800 bg-opacity-75 text-white placeholder-gray-300 border-none outline-none"
                />
            </div>
        )
    }
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-kuik-dark-text-primary">Create Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-lg">
          <button onClick={() => setStatusType('text')} className="p-6 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors">Text</button>
          <button onClick={() => setStatusType('image')} className="p-6 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors">Image</button>
          <button onClick={() => setStatusType('video')} className="p-6 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors">Video</button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-kuik-dark-bg z-50 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-kuik-panel-header dark:bg-kuik-dark-header border-b border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-panel">
          <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-kuik-dark-text-primary">
          {statusType ? `New ${statusType} status` : 'Create Status'}
        </h2>
        <div className="w-10"></div>
      </header>
      <div className="flex-1 relative">
        {renderContent()}
      </div>
      {statusType && (
        <div className="p-4 bg-kuik-panel-header dark:bg-kuik-dark-header">
            <button
              onClick={handlePost}
              className="w-full flex items-center justify-center p-3 bg-kuik-accent text-white rounded-full hover:bg-kuik-green transition-colors disabled:bg-gray-400"
              disabled={statusType === 'text' && !text.trim()}
            >
              <span className="mr-2">Post</span>
              <SendIcon className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
};

export default StatusCreator;