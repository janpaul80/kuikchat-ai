
import React, { useState } from 'react';
import { CloseIcon, CalendarIcon, CheckIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { CalendarEvent } from '../types';

interface EventCreatorProps {
  onClose: () => void;
  onSendEvent: (event: CalendarEvent) => void;
}

const EventCreator: React.FC<EventCreatorProps> = ({ onClose, onSendEvent }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && date && time) {
        onSendEvent({
            title,
            description,
            date,
            time,
            location
        });
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-kuik-dark-panel rounded-lg shadow-2xl w-full max-w-md flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-kuik-dark-text-primary flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-kuik-accent"/>
            {t('eventCreator.title')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-header">
            <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('eventCreator.eventTitle')}</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('eventCreator.description')}</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                    rows={2}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('eventCreator.date')}</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('eventCreator.time')}</label>
                    <input
                        type="time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('eventCreator.location')}</label>
                 <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                />
            </div>
            
            <footer className="pt-4 flex justify-end gap-3">
                 <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    {t('eventCreator.cancel')}
                </button>
                <button 
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-kuik-accent text-white font-semibold rounded-lg hover:bg-kuik-green transition-colors"
                >
                    <CheckIcon className="w-5 h-5" />
                    {t('eventCreator.send')}
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default EventCreator;
