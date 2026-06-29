import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { CloseIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface AddContactViewProps {
  currentUser: User;
  onClose: () => void;
  onScanSuccess: (username: string) => void;
}

const Scanner: React.FC<{ onScanSuccess: (username: string) => void }> = ({ onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsScanning(true);

            // Simulate scanning after 3 seconds
            timeoutId = window.setTimeout(() => {
                onScanSuccess('@dana'); // Hardcoded username for Dana
            }, 3000);
          }
        } else {
          setError('Camera not supported by your browser.');
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError('Camera permission denied. Please enable it in your browser settings.');
      }
    };
    
    startCamera();

    return () => {
      // Cleanup
      if (timeoutId) clearTimeout(timeoutId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black">
      <div className="relative w-full max-w-sm aspect-square">
        {error ? (
          <div className="w-full h-full flex items-center justify-center p-4 text-center bg-gray-800 text-red-400 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 border-4 border-dashed border-white/50 rounded-lg"></div>
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-white text-lg font-medium animate-pulse">
        {isScanning ? 'Scanning...' : 'Initializing Camera...'}
      </p>
    </div>
  );
};

const AddContactView: React.FC<AddContactViewProps> = ({ currentUser, onClose, onScanSuccess }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'my-code' | 'scan-code'>('my-code');
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=kuikchat:${currentUser.username}&color=075E54&bgcolor=ffffff&qzone=1`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-kuik-dark-panel rounded-lg shadow-2xl w-full max-w-md flex flex-col animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-kuik-dark-text-primary">{t('addContact.title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-kuik-dark-header">
            <CloseIcon className="w-6 h-6 text-gray-700 dark:text-kuik-dark-text-secondary" />
          </button>
        </header>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('my-code')}
            className={`flex-1 p-3 text-center font-semibold transition-colors ${activeTab === 'my-code' ? 'text-kuik-green border-b-2 border-kuik-green' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-kuik-dark-header'}`}
          >
            {t('addContact.myCode')}
          </button>
          <button 
            onClick={() => setActiveTab('scan-code')}
            className={`flex-1 p-3 text-center font-semibold transition-colors ${activeTab === 'scan-code' ? 'text-kuik-green border-b-2 border-kuik-green' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-kuik-dark-header'}`}
          >
            {t('addContact.scanCode')}
          </button>
        </div>

        <div className="p-6 flex-1 min-h-[400px]">
          {activeTab === 'my-code' && (
            <div className="flex flex-col items-center justify-center text-center h-full">
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <img src={qrCodeUrl} alt="Your KuikChat QR Code" width="256" height="256" />
                </div>
                <h3 className="text-2xl font-bold mt-6 text-gray-800 dark:text-kuik-dark-text-primary">{currentUser.name}</h3>
                <p className="mt-2 text-gray-500 dark:text-kuik-dark-text-secondary">
                    {t('addContact.scanMessage')}
                </p>
            </div>
          )}
          {activeTab === 'scan-code' && (
             <div className="-m-6 h-[calc(100%+48px)]">
                 <Scanner onScanSuccess={onScanSuccess} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddContactView;