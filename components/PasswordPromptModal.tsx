
import React, { useState } from 'react';
import { KeyIcon, CloseIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

type PasswordPromptMode = 'set' | 'enter' | 'change';

interface PasswordPromptModalProps {
  mode: PasswordPromptMode;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error?: string | null;
}

const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({ mode, onClose, onSubmit, error }) => {
  const [password, setPassword] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  const titles: Record<PasswordPromptMode, string> = {
    set: t('hiddenChats.setPasswordPrompt'),
    enter: t('hiddenChats.unlockPrompt'),
    change: t('hiddenChats.changePasswordPrompt'),
  };

  const submitTexts: Record<PasswordPromptMode, string> = {
    set: t('hiddenChats.set'),
    enter: t('hiddenChats.unlock'),
    change: t('hiddenChats.change'),
  };
  
  const title = titles[mode];
  const submitText = submitTexts[mode];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-kuik-dark-panel rounded-lg shadow-2xl w-full max-w-sm flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-kuik-dark-text-primary flex items-center gap-2">
            <KeyIcon className="w-6 h-6 text-kuik-accent"/>
            {t('hiddenChats.title')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-header">
            <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <p className="text-center text-gray-600 dark:text-kuik-dark-text-secondary">{title}</p>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('hiddenChats.password')}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-kuik-dark-header text-gray-800 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
                        autoFocus
                    />
                     {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>

            <footer className="p-4 bg-gray-50 dark:bg-kuik-dark-header border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    {t('hiddenChats.cancel')}
                </button>
                <button 
                    type="submit"
                    disabled={!password.trim()}
                    className="px-4 py-2 bg-kuik-accent text-white font-semibold rounded-lg hover:bg-kuik-green transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {submitText}
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default PasswordPromptModal;
