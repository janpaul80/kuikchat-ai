import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { MicrophoneIcon, MuteMicrophoneIcon, VideoCameraIcon, StopVideoCameraIcon, EndCallIcon, LockClosedIcon, SparklesIcon } from './icons';

interface VideoCallViewProps {
    callInfo: {
        chatId: string;
        participants: User[];
    };
    currentUser: User;
    onEndCall: () => void;
}

const LENSES = [
    { id: 'none', name: 'None' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'sunglasses', name: 'Cool' },
    { id: 'party-hat', name: 'Party' },
];

const SunglassesOverlay = () => (
    <svg viewBox="0 0 100 35" className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[60%] h-auto z-10 opacity-90" preserveAspectRatio="xMidYMid meet">
        <path d="M10,15 C10,5 20,5 30,15 L30,25 C30,35 20,35 10,25 Z" fill="#222" stroke="#444" strokeWidth="1"/>
        <path d="M70,15 C70,5 80,5 90,15 L90,25 C90,35 80,35 70,25 Z" fill="#222" stroke="#444" strokeWidth="1"/>
        <path d="M30,15 C40,10 60,10 70,15" fill="none" stroke="#333" strokeWidth="2"/>
        <path d="M5,15 L-5,12" fill="none" stroke="#333" strokeWidth="1.5"/>
        <path d="M95,15 L105,12" fill="none" stroke="#333" strokeWidth="1.5"/>
    </svg>
);

const PartyHatOverlay = () => (
     <svg viewBox="0 0 100 100" className="absolute bottom-[65%] left-1/2 -translate-x-1/2 w-[40%] h-auto z-10" preserveAspectRatio="xMidYMid meet">
        <polygon points="50,0 20,100 80,100" fill="#f0f"/>
        <polygon points="50,0 20,100 80,100" fill="url(#hatGradient)"/>
        <circle cx="50" cy="15" r="8" fill="yellow"/>
        <circle cx="35" cy="55" r="5" fill="cyan"/>
        <circle cx="65" cy="55" r="5" fill="cyan"/>
        <circle cx="50" cy="80" r="6" fill="lime"/>
        <defs>
            <linearGradient id="hatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#ff00ff', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#00ffff', stopOpacity: 1}} />
            </linearGradient>
        </defs>
    </svg>
);


const ParticipantTile: React.FC<{
    participant: User;
    isCurrentUser: boolean;
    localStream: MediaStream | null;
    isMuted: boolean;
    isCameraOff: boolean;
    activeLens: string | null;
}> = ({ participant, isCurrentUser, localStream, isMuted, isCameraOff, activeLens }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isCurrentUser && videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
        }
    }, [isCurrentUser, localStream]);

    const showVideo = isCurrentUser && localStream && !isCameraOff;
    const videoFilterStyle = isCurrentUser && activeLens === 'vintage' ? { filter: 'sepia(0.8) contrast(1.1)' } : {};

    return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-lg">
            {showVideo ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={videoFilterStyle}/>
            ) : (
                <>
                    <img src={participant.avatar} alt={participant.name} className="w-24 h-24 rounded-full opacity-50" />
                    {isCurrentUser && !localStream && <p className="absolute text-white text-sm">Starting camera...</p>}
                </>
            )}
             {isCurrentUser && !isCameraOff && activeLens === 'sunglasses' && <SunglassesOverlay />}
             {isCurrentUser && !isCameraOff && activeLens === 'party-hat' && <PartyHatOverlay />}
            
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center">
                    <span className="text-white font-semibold truncate">{participant.name}</span>
                    {(isMuted || (isCurrentUser && isMuted)) && (
                         <MuteMicrophoneIcon className="w-4 h-4 text-white ml-2" />
                    )}
                </div>
            </div>
        </div>
    );
};

const VideoCallView: React.FC<VideoCallViewProps> = ({ callInfo, currentUser, onEndCall }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [showLensPicker, setShowLensPicker] = useState(false);
    const [activeLens, setActiveLens] = useState<string | null>('none');
    const controlsTimeoutRef = useRef<number | null>(null);
    
    // Simulate remote participants' states
    const [remoteStates, setRemoteStates] = useState<Record<string, {isMuted: boolean, isCameraOff: boolean}>>({});

    useEffect(() => {
        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
            } catch (err) {
                console.error("Error accessing media devices.", err);
                alert("Could not access camera and microphone. Please check permissions and try again.");
                onEndCall();
            }
        };

        startMedia();

        return () => {
            localStream?.getTracks().forEach(track => track.stop());
        };
    }, []);
    
    useEffect(() => {
        // Initialize remote states
        const initialStates: Record<string, {isMuted: boolean, isCameraOff: boolean}> = {};
        callInfo.participants.forEach(p => {
            if (p.id !== currentUser.id) {
                initialStates[p.id] = { isMuted: Math.random() > 0.8, isCameraOff: Math.random() > 0.7 };
            }
        });
        setRemoteStates(initialStates);
    }, [callInfo.participants, currentUser.id]);


    const handleToggleMute = () => {
        if (!localStream) return;
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMuted(prev => !prev);
    };

    const handleToggleCamera = () => {
        if (!localStream) return;
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsCameraOff(prev => !prev);
    };

    const hideControls = () => {
        setControlsVisible(false);
        setShowLensPicker(false);
    }
    
    const showControls = () => {
        setControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = window.setTimeout(hideControls, 4000);
    };
    
    useEffect(() => {
        showControls(); // Show on mount
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);


    const getGridClasses = (count: number) => {
        if (count <= 1) return 'grid-cols-1 grid-rows-1';
        if (count === 2) return 'grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1';
        if (count <= 4) return 'grid-cols-2 grid-rows-2';
        if (count <= 6) return 'grid-cols-3 grid-rows-2';
        if (count <= 9) return 'grid-cols-3 grid-rows-3';
        if (count <= 12) return 'grid-cols-4 grid-rows-3';
        if (count <= 16) return 'grid-cols-4 grid-rows-4';
        if (count <= 20) return 'grid-cols-5 grid-rows-4';
        if (count <= 25) return 'grid-cols-5 grid-rows-5';
        if (count <= 30) return 'grid-cols-6 grid-rows-5';
        if (count <= 36) return 'grid-cols-6 grid-rows-6';
        if (count <= 42) return 'grid-cols-7 grid-rows-6';
        if (count <= 49) return 'grid-cols-7 grid-rows-7';
        return 'grid-cols-8 grid-rows-7'; // Supports up to 56, covering the max of 50
    };
    
    return (
        <div className="fixed inset-0 bg-gray-800 z-50 flex flex-col" onMouseMove={showControls} onClick={showControls}>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white z-20">
                <LockClosedIcon className="w-4 h-4 mr-2" />
                <span>End-to-end Encrypted</span>
            </div>

            <div className={`flex-1 p-4 pt-16 grid gap-4 ${getGridClasses(callInfo.participants.length)}`}>
                {callInfo.participants.map(p => (
                    <ParticipantTile
                        key={p.id}
                        participant={p}
                        isCurrentUser={p.id === currentUser.id}
                        localStream={localStream}
                        isMuted={p.id === currentUser.id ? isMuted : (remoteStates[p.id]?.isMuted || false)}
                        isCameraOff={p.id === currentUser.id ? isCameraOff : (remoteStates[p.id]?.isCameraOff || false)}
                        activeLens={activeLens}
                    />
                ))}
            </div>

            <div className={`absolute bottom-24 left-0 right-0 flex justify-center p-4 transition-all duration-300 z-10 ${controlsVisible && showLensPicker ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm p-2 rounded-full">
                    {LENSES.map(lens => (
                        <button
                            key={lens.id}
                            onClick={() => setActiveLens(lens.id)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${activeLens === lens.id ? 'bg-kuik-accent text-white' : 'text-gray-200 hover:bg-white/20'}`}
                        >
                            {lens.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 flex justify-center p-4 transition-opacity duration-300 z-10 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm p-4 rounded-full">
                    <button
                        onClick={handleToggleMute}
                        className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-white text-black' : 'bg-gray-600/70 text-white hover:bg-gray-500/70'}`}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MuteMicrophoneIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                    </button>
                     <button
                        onClick={() => setShowLensPicker(prev => !prev)}
                        className={`p-3 rounded-full transition-colors ${showLensPicker ? 'bg-kuik-accent/80 text-white' : 'bg-gray-600/70 text-white hover:bg-gray-500/70'}`}
                        aria-label="Lenses"
                        title="Lenses"
                    >
                        <SparklesIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onEndCall}
                        className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                        aria-label="End call"
                    >
                        <EndCallIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleToggleCamera}
                        className={`p-3 rounded-full transition-colors ${isCameraOff ? 'bg-white text-black' : 'bg-gray-600/70 text-white hover:bg-gray-500/70'}`}
                        aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                    >
                        {isCameraOff ? <StopVideoCameraIcon className="w-6 h-6" /> : <VideoCameraIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallView;