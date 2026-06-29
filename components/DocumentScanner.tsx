
import React, { useRef, useState, useEffect } from 'react';
import { CloseIcon, ScanIcon, CheckIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface DocumentScannerProps {
  onClose: () => void;
  onSendDocument: (imageDataUrl: string) => void;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onClose, onSendDocument }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
            setError('Camera not supported.');
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('Camera permission denied.');
      }
    };

    if (!capturedImage) {
        startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        // Stop stream to save battery
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleRetake = () => {
      setCapturedImage(null);
  };

  const handleSend = () => {
      if (capturedImage) {
          onSendDocument(capturedImage);
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
       <header className="flex items-center justify-between p-4 bg-black/50 text-white z-10 absolute top-0 left-0 right-0">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ScanIcon className="w-6 h-6"/>
            {t('documentScanner.title')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
             {error ? (
                <div className="text-red-500">{error}</div>
             ) : (
                 <>
                    {!capturedImage ? (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                            {/* Scanning Overlay */}
                            <div className="absolute inset-0 border-[50px] border-black/50 pointer-events-none">
                                <div className="w-full h-full border-2 border-white/50 relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-kuik-accent"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-kuik-accent"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-kuik-accent"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-kuik-accent"></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <img src={capturedImage} alt="Captured Document" className="w-full h-full object-contain" />
                    )}
                 </>
             )}
             <canvas ref={canvasRef} className="hidden" />
        </div>

        <footer className="p-6 bg-black text-white flex justify-center items-center gap-8 min-h-[100px]">
            {!capturedImage ? (
                <button 
                    onClick={handleCapture}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-colors"
                    aria-label={t('documentScanner.capture')}
                >
                    <div className="w-12 h-12 bg-white rounded-full"></div>
                </button>
            ) : (
                 <>
                    <button 
                        onClick={handleRetake}
                        className="px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                        {t('documentScanner.retake')}
                    </button>
                    <button 
                        onClick={handleSend}
                        className="px-6 py-3 bg-kuik-accent rounded-lg font-semibold hover:bg-kuik-green transition-colors flex items-center gap-2"
                    >
                        <CheckIcon className="w-5 h-5" />
                        {t('documentScanner.send')}
                    </button>
                 </>
            )}
        </footer>
    </div>
  );
};

export default DocumentScanner;
