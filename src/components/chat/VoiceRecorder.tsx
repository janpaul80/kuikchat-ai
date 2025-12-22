import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Trash2, Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(40).fill(0.15));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || isPaused) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const bars = 40;
    const step = Math.floor(dataArray.length / bars);
    const newWaveform = [];
    
    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step] / 255;
      newWaveform.push(Math.max(0.08, Math.min(value, 0.9)));
    }
    
    setWaveformData(newWaveform);
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      updateWaveform();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      updateWaveform();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const handleSend = () => {
    if (isRecording) {
      stopRecording();
    }
    // Small delay to ensure blob is ready
    setTimeout(() => {
      if (audioBlob || chunksRef.current.length > 0) {
        const finalBlob = audioBlob || new Blob(chunksRef.current, { type: "audio/webm" });
        onSend(finalBlob, duration);
        resetState();
      }
    }, 100);
  };

  const handleDelete = () => {
    stopRecording();
    resetState();
  };

  const handleCancel = () => {
    stopRecording();
    resetState();
    onCancel();
  };

  const resetState = () => {
    setAudioBlob(null);
    setDuration(0);
    setWaveformData(new Array(40).fill(0.15));
    setIsRecording(false);
    setIsPaused(false);
  };

  useEffect(() => {
    // Auto-start recording when component mounts
    startRecording();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex items-center gap-2 px-3 py-2 bg-background rounded-full border border-border shadow-lg"
    >
      {/* Delete/Trash button */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 w-10 h-10 rounded-full hover:bg-muted/50 text-muted-foreground"
        onClick={handleDelete}
      >
        <Trash2 className="w-5 h-5" />
      </Button>

      {/* Recording indicator dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${isRecording && !isPaused ? "bg-red-500" : "bg-muted-foreground"}`} />

      {/* Timer */}
      <span className="text-sm font-mono text-foreground min-w-[40px]">
        {formatDuration(duration)}
      </span>

      {/* Waveform visualization */}
      <div className="flex-1 flex items-center justify-center gap-[1px] h-6 px-2">
        {waveformData.map((height, index) => (
          <motion.div
            key={index}
            className="w-[2px] rounded-full bg-muted-foreground/60"
            animate={{ 
              height: `${Math.max(3, height * 20)}px`,
            }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>

      {/* Pause/Resume button */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 w-9 h-9 rounded-full border border-border hover:bg-muted/50"
        onClick={isPaused ? resumeRecording : pauseRecording}
        disabled={!isRecording}
      >
        {isPaused ? (
          <Play className="w-4 h-4 text-foreground" />
        ) : (
          <Pause className="w-4 h-4 text-foreground" />
        )}
      </Button>

      {/* Stop button */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 w-9 h-9 rounded-full border border-border hover:bg-muted/50"
        onClick={stopRecording}
        disabled={!isRecording}
      >
        <div className="w-3 h-3 rounded-sm bg-foreground" />
      </Button>

      {/* Send button */}
      <Button
        size="icon"
        className="shrink-0 w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-md"
        onClick={handleSend}
      >
        <Send className="w-5 h-5" />
      </Button>
    </motion.div>
  );
};

// Playback component for voice notes
interface VoiceNotePlayerProps {
  audioUrl: string;
  duration: number;
}

export const VoiceNotePlayer = ({ audioUrl, duration }: VoiceNotePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      setIsLoading(true);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.oncanplay = () => setIsLoading(false);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="w-10 h-10 rounded-full bg-current/20 flex items-center justify-center hover:bg-current/30 transition-colors shrink-0"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      
      {/* Waveform visualization */}
      <div className="flex-1 flex items-center gap-0.5 h-6">
        {Array.from({ length: 20 }).map((_, i) => {
          const barProgress = (i / 20) * 100;
          const isActive = barProgress <= progress;
          const height = 20 + Math.sin(i * 0.5) * 60 + Math.random() * 20;
          
          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all ${
                isActive ? "opacity-100" : "opacity-40"
              }`}
              style={{ 
                height: `${height}%`,
                backgroundColor: "currentColor"
              }}
            />
          );
        })}
      </div>
      
      <span className="text-xs font-mono opacity-70 min-w-[40px] text-right">
        {formatTime(isPlaying ? currentTime : duration)}
      </span>
    </div>
  );
};
