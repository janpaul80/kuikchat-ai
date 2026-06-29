import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { ChevronLeftIcon, SearchIcon, CloseIcon, CheckIcon, ArrowRightIcon, PhotoIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateGroupViewProps {
  contacts: User[];
  currentUser: User;
  onClose: () => void;
  onCreateGroup: (participants: User[], groupName: string) => void;
}

const CreateGroupView: React.FC<CreateGroupViewProps> = ({ contacts, currentUser, onClose, onCreateGroup }) => {
  const [step, setStep] = useState<'select_participants' | 'group_info'>('select_participants');
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const filteredContacts = useMemo(() =>
    contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchQuery.toLowerCase())
    ), [contacts, searchQuery]);

  const handleToggleParticipant = (user: User) => {
    setSelectedParticipants(prev =>
      prev.some(p => p.id === user.id)
        ? prev.filter(p => p.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedParticipants.length > 0) {
      onCreateGroup(selectedParticipants, groupName.trim());
    }
  };

  const renderSelectParticipants = () => (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {selectedParticipants.length > 0 && (
          <div className="mb-4 h-20">
            <p className="text-sm font-semibold text-kuik-green dark:text-kuik-light-green mb-2">{t('createGroup.selected', { count: selectedParticipants.length })}</p>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {selectedParticipants.map(user => (
                <div key={user.id} className="relative flex-shrink-0 text-center">
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                  <button
                    onClick={() => handleToggleParticipant(user)}
                    className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-0.5"
                  >
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400 dark:text-kuik-dark-text-secondary" />
          </div>
          <input
            type="text"
            placeholder={t('createGroup.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-gray-100 dark:bg-kuik-dark-header border-gray-200 dark:border-gray-600 text-gray-900 dark:text-kuik-dark-text-primary focus:outline-none focus:ring-2 focus:ring-kuik-light-green"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map(user => {
          const isSelected = selectedParticipants.some(p => p.id === user.id);
          return (
            <div
              key={user.id}
              onClick={() => handleToggleParticipant(user)}
              className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-kuik-dark-header transition-colors"
            >
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-4" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-kuik-dark-text-primary">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-kuik-dark-text-secondary">{user.username}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-kuik-accent border-kuik-accent' : 'border-gray-300 dark:border-gray-600'}`}>
                {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderGroupInfo = () => (
    <div className="p-6 flex flex-col items-center">
        <div className="relative mb-6">
            <button className="w-32 h-32 bg-gray-200 dark:bg-kuik-dark-header rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-kuik-dark-panel">
                <PhotoIcon className="w-16 h-16" />
            </button>
        </div>
        <input
            type="text"
            placeholder={t('createGroup.groupNamePlaceholder')}
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="w-full p-3 text-center text-lg border-b-2 border-kuik-green bg-transparent focus:outline-none text-gray-800 dark:text-kuik-dark-text-primary"
            autoFocus
        />
        <p className="mt-8 text-sm font-semibold text-gray-600 dark:text-kuik-dark-text-secondary">
            {t('createGroup.participants', { count: selectedParticipants.length + 1 })}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
            {[currentUser, ...selectedParticipants].map(user => (
                <div key={user.id} className="text-center w-16">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mx-auto"/>
                    <p className="text-xs truncate mt-1 text-gray-500 dark:text-kuik-dark-text-secondary">{user.name.split(' ')[0]}</p>
                </div>
            ))}
        </div>
    </div>
  );
  
  const handleBack = () => {
    if (step === 'group_info') {
      setStep('select_participants');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-kuik-dark-bg z-40 flex flex-col">
      <header className="flex-shrink-0 bg-kuik-light-green text-white p-4 flex items-center shadow-md">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-white/20">
          <ChevronLeftIcon className="w-6 h-6 transform -translate-x-0.5" />
        </button>
        <div className="ml-4">
            <h2 className="text-xl font-semibold">
                {step === 'select_participants' ? t('createGroup.addParticipants') : t('createGroup.newGroup')}
            </h2>
            {step === 'select_participants' && <p className="text-sm opacity-90">{t('createGroup.selected', { count: selectedParticipants.length })}</p>}
        </div>
      </header>
      <div className="flex-1 flex flex-col relative">
        {step === 'select_participants' ? renderSelectParticipants() : renderGroupInfo()}
        
        <div className="absolute bottom-6 right-6">
            {step === 'select_participants' && (
                <button 
                    onClick={() => setStep('group_info')}
                    disabled={selectedParticipants.length === 0}
                    className="bg-kuik-accent text-white p-4 rounded-full shadow-lg hover:bg-kuik-green transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            )}
            {step === 'group_info' && (
                <button 
                    onClick={handleCreate}
                    disabled={!groupName.trim()}
                    className="bg-kuik-accent text-white p-4 rounded-full shadow-lg hover:bg-kuik-green transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <CheckIcon className="w-6 h-6" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupView;