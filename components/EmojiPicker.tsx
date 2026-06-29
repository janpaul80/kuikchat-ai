
import React, { useEffect, useRef, useState } from 'react';
import { EmojiIcon, GifIcon, StickerIcon, SearchIcon } from './icons';

interface ExpressionPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (url: string) => void;
  onSelectSticker: (url: string) => void;
  onClose: () => void;
  initialTab?: 'emoji' | 'gif' | 'sticker';
}

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉',
  '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '🤨', '🧐',
  '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵',
  '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐',
  '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵',
  '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹',
  '👺', '🤡', '💩', '👻', '💀', '👽', '👾', '🤖', '🎃', '😺', '😺', '😹', '😻',
  '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️',
  '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊',
  '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪',
  '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '❤️',
];

const trendingGifs = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3prMDdweW16YjZzZzZ5dXE5bWNmdjBvenZrdnp2c3l1b3VzenJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o72FfM5HJydzafgUE/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmV0M2o5cGZzZDRkd2RmdG5iMjdjaXF2aTlwM25zbGljaTdrbm5mMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OK27wINdQS5YQ/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmk5N21tNXZyM2kweDRnaTJidG9nNW52MGs2a2M1bTRmZzU5d3hzYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8vQSQ3cNXuDGo/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2JzMmpwZ2N0Z3Q2ZXQ4MTN0Mmd4MGF1M2JzMDU3aWJzbDJhZHNjaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BPJmthQ3YRwD6/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXF0M2Q3eG50eGR2enJzbm55cWdpaTl0ZGJ6a2FudnZua2VlMTIzcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26n6Gx9moCgs1pUuk/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnVmbXVscXpibjQxOWdzaDRyM3N5enZ3dTJ0aGdybXRscjF3Z2JkZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif',
];

const mockGifs: Record<string, string[]> = {
    happy: [
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHE1ZzN1enV2aDl0czJ0a3J0MGQ5aG1mYWV6ZDRsdDF5aW10eGdybCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/14udF3WU0Gz5aU/giphy.gif',
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3o3N3ZkOWwxb205dThveTBud3BmbWpudjVqd2JpcXFpcTlsNGZrayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5GoVLqeAOo6PK/giphy.gif',
    ],
    sad: [
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZW1taTExczhqZTR3MXJkYnVwM2Z4bnQ4aDlxbDVtdXlkNjVuMW5iZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6wreoanON3a7vDbi/giphy.gif',
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWVscTljYm1wZnd6eHl2a2xocDF5d2ZtYmZlZDh5Zzh5MG1yNnpqeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BEobwFtfU0Tks/giphy.gif',
    ],
    excited: [
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjYxZDFtc2VucjgzMWRoZm4yMmp1eGk5Nm14cXVtdDJ6YXJodXU5dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5ndfCgDddI9GM/giphy.gif',
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXl2b28xOHdha2Y4MTk4OTk5aGcybTh4N25tbTJpMXFvNGs3emN1eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26uf3m06I94sQvE6Q/giphy.gif'
    ],
};


const stickerPacks = {
    "Robots": [
        'https://robohash.org/robot1?set=set1',
        'https://robohash.org/robot2?set=set1',
        'https://robohash.org/robot3?set=set1',
        'https://robohash.org/robot4?set=set1',
        'https://robohash.org/robot5?set=set1',
        'https://robohash.org/robot6?set=set1',
        'https://robohash.org/robot7?set=set1',
        'https://robohash.org/robot8?set=set1',
    ],
    "Monsters": [
        'https://robohash.org/monster1?set=set2',
        'https://robohash.org/monster2?set=set2',
        'https://robohash.org/monster3?set=set2',
        'https://robohash.org/monster4?set=set2',
        'https://robohash.org/monster5?set=set2',
        'https://robohash.org/monster6?set=set2',
        'https://robohash.org/monster7?set=set2',
        'https://robohash.org/monster8?set=set2',
    ],
    "Cats": [
        'https://robohash.org/cat1?set=set4',
        'https://robohash.org/cat2?set=set4',
        'https://robohash.org/cat3?set=set4',
        'https://robohash.org/cat4?set=set4',
        'https://robohash.org/cat5?set=set4',
        'https://robohash.org/cat6?set=set4',
        'https://robohash.org/cat7?set=set4',
        'https://robohash.org/cat8?set=set4',
    ]
};


const ExpressionPicker: React.FC<ExpressionPickerProps> = ({ onSelectEmoji, onSelectGif, onSelectSticker, onClose, initialTab = 'emoji' }) => {
    const pickerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [gifSearchQuery, setGifSearchQuery] = useState('');
    const [displayedGifs, setDisplayedGifs] = useState(trendingGifs);
    const [isSearchingGifs, setIsSearchingGifs] = useState(false);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

     useEffect(() => {
        const searchTimeout = setTimeout(() => {
            if (activeTab !== 'gif') return;

            if (gifSearchQuery.trim() === '') {
                setDisplayedGifs(trendingGifs);
                return;
            }

            setIsSearchingGifs(true);
            const query = gifSearchQuery.toLowerCase();
            // Simulate API call
            setTimeout(() => {
                const results = Object.keys(mockGifs).reduce((acc: string[], key) => {
                    if (key.includes(query)) {
                        return [...acc, ...mockGifs[key]];
                    }
                    return acc;
                }, []);
                
                setDisplayedGifs(results.length > 0 ? Array.from(new Set(results)) : []);
                setIsSearchingGifs(false);
            }, 500);

        }, 300); // Debounce search

        return () => clearTimeout(searchTimeout);
    }, [gifSearchQuery, activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'gif':
                return (
                    <div className="p-2 h-full flex flex-col">
                        <div className="relative mb-2">
                            <input 
                                type="text" 
                                placeholder="Search GIFs" 
                                className="w-full p-2 pl-8 rounded-lg bg-gray-100 dark:bg-kuik-dark-panel border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-kuik-light-green"
                                value={gifSearchQuery}
                                onChange={(e) => setGifSearchQuery(e.target.value)}
                            />
                            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        </div>
                        {isSearchingGifs ? (
                            <div className="flex-1 flex items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-kuik-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 custom-scrollbar">
                                {displayedGifs.map((gif, i) => (
                                    <img 
                                        key={i} 
                                        src={gif} 
                                        alt="gif" 
                                        className="w-full h-auto rounded cursor-pointer hover:opacity-80"
                                        onClick={() => { onSelectGif(gif); onClose(); }}
                                    />
                                ))}
                                {displayedGifs.length === 0 && <p className="text-center text-gray-500 mt-4 col-span-2">No GIFs found.</p>}
                            </div>
                        )}
                    </div>
                );
            case 'sticker':
                return (
                    <div className="p-2 h-full overflow-y-auto custom-scrollbar">
                        {Object.entries(stickerPacks).map(([packName, urls]) => (
                            <div key={packName} className="mb-4">
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">{packName}</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {urls.map((url, i) => (
                                        <img 
                                            key={i} 
                                            src={url} 
                                            alt="sticker" 
                                            className="w-full h-auto cursor-pointer hover:scale-110 transition-transform"
                                            onClick={() => { onSelectSticker(url); onClose(); }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'emoji':
            default:
                return (
                    <div className="p-2 grid grid-cols-8 gap-1 overflow-y-auto h-full custom-scrollbar">
                        {emojis.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => onSelectEmoji(emoji)}
                                className="text-2xl p-1 hover:bg-gray-100 dark:hover:bg-kuik-dark-panel rounded transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div ref={pickerRef} className="absolute bottom-16 left-0 w-80 h-80 bg-white dark:bg-kuik-dark-header rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-fade-in-up">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button 
                    className={`flex-1 p-3 flex justify-center transition-colors ${activeTab === 'emoji' ? 'border-b-2 border-kuik-accent text-kuik-accent' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-kuik-dark-panel'}`}
                    onClick={() => setActiveTab('emoji')}
                >
                    <EmojiIcon className="w-6 h-6"/>
                </button>
                <button 
                    className={`flex-1 p-3 flex justify-center transition-colors ${activeTab === 'gif' ? 'border-b-2 border-kuik-accent text-kuik-accent' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-kuik-dark-panel'}`}
                    onClick={() => setActiveTab('gif')}
                >
                    <GifIcon className="w-6 h-6"/>
                </button>
                <button 
                    className={`flex-1 p-3 flex justify-center transition-colors ${activeTab === 'sticker' ? 'border-b-2 border-kuik-accent text-kuik-accent' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-kuik-dark-panel'}`}
                    onClick={() => setActiveTab('sticker')}
                >
                    <StickerIcon className="w-6 h-6"/>
                </button>
            </div>
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};

export default ExpressionPicker;
