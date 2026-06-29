
import React, { useRef, useState, useEffect } from 'react';
import { CloseIcon, CameraIcon, CheckIcon } from './icons';

interface CameraEffectModalProps {
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const EFFECTS = [
  { id: 'normal', name: 'Normal', filter: 'none' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(0.5) contrast(1.2)' },
  { id: 'bw', name: 'B&W', filter: 'grayscale(1)' },
  { id: 'warm', name: 'Warm', filter: 'sepia(0.3) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.5)' },
  { id: 'dramatic', name: 'Dramatic', filter: 'contrast(1.5) brightness(0.8)' },
  { id: 'glow', name: 'Glow', filter: 'brightness(1.2) saturate(1.2) blur(0.5px)' },
  { id: 'cyber', name: 'Cyber', filter: 'saturate(2) hue-rotate(90deg) contrast(1.2)' },
  { id: 'noir', name: 'Noir', filter: 'grayscale(1) contrast(2) brightness(0.6)' },
  { id: 'fade', name: 'Fade', filter: 'opacity(0.8) brightness(1.1)' },
  { id: 'sepia', name: 'Sepia', filter: 'sepia(1)' },
  { id: 'invert', name: 'Invert', filter: 'invert(1)' },
  { id: 'huerotate90', name: 'Hue 90', filter: 'hue-rotate(90deg)' },
  { id: 'huerotate180', name: 'Hue 180', filter: 'hue-rotate(180deg)' },
  { id: 'huerotate270', name: 'Hue 270', filter: 'hue-rotate(270deg)' },
  { id: 'blur', name: 'Blur', filter: 'blur(2px)' },
  { id: 'saturate', name: 'Vivid', filter: 'saturate(3)' },
  { id: 'desaturate', name: 'Muted', filter: 'saturate(0.2)' },
  { id: 'brightness', name: 'Bright', filter: 'brightness(1.5)' },
  { id: 'darkness', name: 'Dark', filter: 'brightness(0.5)' },
  { id: 'contrast_high', name: 'High Con', filter: 'contrast(2)' },
  { id: 'contrast_low', name: 'Low Con', filter: 'contrast(0.5)' },
  { id: 'redtint', name: 'Red', filter: 'sepia(1) hue-rotate(-50deg) saturate(4)' },
  { id: 'greentint', name: 'Green', filter: 'sepia(1) hue-rotate(100deg) saturate(4)' },
  { id: 'bluetint', name: 'Blue', filter: 'sepia(1) hue-rotate(200deg) saturate(4)' },
  { id: 'gold', name: 'Gold', filter: 'sepia(1) saturate(2) brightness(1.1)' },
  { id: 'pastel', name: 'Pastel', filter: 'brightness(1.2) saturate(0.5) contrast(0.8)' },
  { id: 'posterize', name: 'Poster', filter: 'contrast(2) saturate(2) brightness(1.1)' },
  { id: 'dreamy', name: 'Dreamy', filter: 'blur(0.5px) brightness(1.1) saturate(1.5)' },
  { id: 'retro', name: 'Retro', filter: 'sepia(0.8) contrast(1.5) saturate(0.8)' },
];

const CameraEffectModal: React.FC<CameraEffectModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeEffect, setActiveEffect] = useState(EFFECTS[0]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Could not access camera.");
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
        ctx.filter = activeEffect.filter;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL('image/jpeg'));
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col animate-fade-in">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 text-white">
        <h2 className="text-xl font-bold tracking-wide">Camera Effects</h2>
        <button onClick={onClose} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all border border-white/10">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="relative w-full max-w-3xl aspect-[9/16] md:aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {!capturedImage ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover transition-all duration-300"
                style={{ filter: activeEffect.filter }}
              />
            ) : (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            )}
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6 z-20 flex flex-col gap-6 bg-gradient-to-t from-black/80 to-transparent pb-10">
        {!capturedImage && (
          <div className="flex overflow-x-auto gap-4 pb-4 px-4 snap-x no-scrollbar mask-image-gradient">
            {EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setActiveEffect(effect)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 transition-transform duration-300 ${activeEffect.id === effect.id ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
              >
                <div 
                  className={`w-16 h-16 rounded-full border-2 overflow-hidden ${activeEffect.id === effect.id ? 'border-kuik-accent ring-2 ring-kuik-accent/50' : 'border-white/30'}`}
                >
                   <div className="w-full h-full bg-gray-300" style={{ filter: effect.filter, backgroundImage: 'url(https://picsum.photos/100)', backgroundSize: 'cover' }} />
                </div>
                <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{effect.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center gap-8">
          {!capturedImage ? (
            <button 
              onClick={handleCapture}
              className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all duration-300 shadow-lg hover:scale-105"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-inner" />
            </button>
          ) : (
            <>
              <button 
                onClick={handleRetake}
                className="px-8 py-3 rounded-full bg-gray-600/80 backdrop-blur-md text-white font-semibold hover:bg-gray-500/80 transition-all border border-white/10"
              >
                Retake
              </button>
              <button 
                onClick={handleConfirm}
                className="w-16 h-16 rounded-full bg-kuik-accent flex items-center justify-center text-white hover:bg-kuik-green transition-all shadow-lg shadow-kuik-accent/30 hover:scale-110"
              >
                <CheckIcon className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraEffectModal;
