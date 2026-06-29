
import React, { useState } from 'react';
import { CloseIcon, CalendarIcon, TimerIcon, CheckIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { RepeatInterval } from '../types';

interface ScheduleMessageModalProps {
  onClose: () => void;
  onSchedule: (text: string, scheduledFor: number, repeatInterval: RepeatInterval) => void;
}

const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({ onClose, onSchedule }) => {
  const { t } = useLanguage();
  const [messageText, setMessageText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && date && time) {
        const scheduledFor = new Date(`${date}T${time}`).getTime();
        if (isNaN(scheduledFor) || scheduledFor < Date.now()) {
            alert("Please select a future date and time.");
            return;
        }
        onSchedule(messageText.trim(), scheduledFor, repeatInterval);
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
            <TimerIcon className="w-6 h-6 text-kuik-accent"/>
            {t('scheduleMessage.title')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-header">
            <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('scheduleMessage.messageLabel')}</label>
                <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green resize-none h-24"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('scheduleMessage.dateLabel')}</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('scheduleMessage.timeLabel')}</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary mb-1">{t('scheduleMessage.repeatLabel')}</label>
                 <select
                    value={repeatInterval}
                    onChange={e => setRepeatInterval(e.target.value as RepeatInterval)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                >
                    <option value="none">{t('scheduleMessage.repeatNone')}</option>
                    <option value="daily">{t('scheduleMessage.repeatDaily')}</option>
                    <option value="weekly">{t('scheduleMessage.repeatWeekly')}</option>
                    <option value="monthly">{t('scheduleMessage.repeatMonthly')}</option>
                </select>
            </div>
            
            <footer className="pt-4 flex justify-end gap-3">
                 <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    {t('scheduleMessage.cancel')}
                </button>
                <button 
                    type="submit"
                    disabled={!messageText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-kuik-accent text-white font-semibold rounded-lg hover:bg-kuik-green transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <CheckIcon className="w-5 h-5" />
                    {t('scheduleMessage.schedule')}
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMessageModal;
