import React, { useRef, useState, useEffect } from 'react';
import { PlayIcon, PauseIcon } from './icons';

interface AudioPlayerProps {
  url: string;
}

const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
            setCurrentTime(formatTime(audio.currentTime));
        };
        const handleLoadedMetadata = () => {
            setDuration(formatTime(audio.duration));
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime('0:00');
            if (audio) audio.currentTime = 0;
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };
    
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const progressContainer = progressRef.current;
        if (!audio || !progressContainer) return;
        
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const duration = audio.duration;

        if (duration) {
            const newTime = (clickX / width) * duration;
            audio.currentTime = newTime;
        }
    };

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg w-64">
            <audio ref={audioRef} src={url} preload="metadata"></audio>
            <button onClick={togglePlayPause} className="text-gray-700 dark:text-gray-200 p-1 flex-shrink-0">
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
                <div ref={progressRef} onClick={handleProgressClick} className="w-full bg-gray-300 dark:bg-gray-500 h-1 rounded-full cursor-pointer">
                    <div className="bg-kuik-accent h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-kuik-dark-text-secondary text-right -mt-1">
                    {duration}
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
