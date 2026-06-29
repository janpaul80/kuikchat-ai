import React, { useState, useEffect } from 'react';
import { Media } from '../types';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, VideoCameraIcon } from './icons';

interface MediaGalleryProps {
  mediaItems: Media[];
  onClose: () => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ mediaItems, onClose }) => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const openViewer = (index: number) => {
    setViewerIndex(index);
  };

  const closeViewer = () => {
    setViewerIndex(null);
  };

  const goToNext = () => {
    if (viewerIndex !== null) {
      setViewerIndex((viewerIndex + 1) % mediaItems.length);
    }
  };

  const goToPrev = () => {
    if (viewerIndex !== null) {
      setViewerIndex((viewerIndex - 1 + mediaItems.length) % mediaItems.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewerIndex !== null) {
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrev();
        if (e.key === 'Escape') closeViewer();
      } else {
        if (e.key === 'Escape') onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerIndex, mediaItems.length]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-kuik-dark-bg z-40 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-kuik-panel-header dark:bg-kuik-dark-header border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-kuik-dark-text-primary">Media Gallery</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-panel">
          <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {mediaItems.map((item, index) => (
            <div key={index} className="aspect-square bg-gray-200 dark:bg-kuik-dark-header rounded-lg overflow-hidden cursor-pointer group" onClick={() => openViewer(index)}>
              {item.type === 'image' && <img src={item.url} alt={`media ${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />}
              {item.type === 'video' && (
                <div className="relative w-full h-full">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                    <VideoCameraIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {viewerIndex !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={closeViewer}>
          <button onClick={(e) => { e.stopPropagation(); goToPrev(); }} className="absolute left-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors">
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {mediaItems[viewerIndex].type === 'image' && <img src={mediaItems[viewerIndex].url} alt="Full screen media" className="max-w-full max-h-full object-contain rounded-lg" />}
            {mediaItems[viewerIndex].type === 'video' && <video src={mediaItems[viewerIndex].url} controls autoPlay className="max-w-full max-h-full rounded-lg" />}
          </div>

          <button onClick={(e) => { e.stopPropagation(); goToNext(); }} className="absolute right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors">
            <ChevronRightIcon className="w-8 h-8" />
          </button>
          <button onClick={closeViewer} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors">
            <CloseIcon className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
