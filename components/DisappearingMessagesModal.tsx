import React from 'react';
import { CloseIcon, TimerIcon } from './icons';

interface DisappearingMessagesModalProps {
  isOpen?: boolean; // For potential future animation control
  onClose: () => void;
  onSetTimer: (duration: number) => void;
  currentTimer: number;
}

const TIMER_OPTIONS = [
  { label: '5 seconds', value: 5000 },
  { label: '10 seconds', value: 10000 },
  { label: '1 minute', value: 60000 },
  { label: 'Off', value: 0 },
];

const DisappearingMessagesModal: React.FC<DisappearingMessagesModalProps> = ({ onClose, onSetTimer, currentTimer }) => {
  const handleSetTimer = (duration: number) => {
    onSetTimer(duration);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-kuik-dark-panel rounded-lg shadow-2xl w-full max-w-sm flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-kuik-dark-text-primary">Disappearing messages</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-header">
            <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
          </button>
        </header>

        <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center">
                <TimerIcon className="w-16 h-16 text-kuik-accent mb-4"/>
                <p className="text-gray-600 dark:text-kuik-dark-text-secondary">
                    For more privacy, turn on disappearing messages. When on, new messages in this chat will disappear after the selected duration.
                </p>
            </div>
            
            <fieldset className="space-y-2">
                <legend className="text-lg font-medium text-gray-800 dark:text-kuik-dark-text-primary mb-2">Message timer</legend>
                {TIMER_OPTIONS.map(option => (
                    <div key={option.value} className="flex items-center">
                        <input
                            type="radio"
                            id={`timer-${option.value}`}
                            name="disappearing-timer"
                            value={option.value}
                            checked={currentTimer === option.value}
                            onChange={() => handleSetTimer(option.value)}
                            className="h-4 w-4 text-kuik-accent focus:ring-kuik-light-green border-gray-300 dark:border-gray-600 dark:bg-kuik-dark-header"
                        />
                        <label htmlFor={`timer-${option.value}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-kuik-dark-text-secondary">
                            {option.label}
                        </label>
                    </div>
                ))}
            </fieldset>
        </div>
      </div>
    </div>
  );
};

export default DisappearingMessagesModal;