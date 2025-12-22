import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Sparkles, 
  Loader2,
  Camera,
  CameraOff,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface MultimodalAICallProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const MultimodalAICall = ({ open, onClose }: MultimodalAICallProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [currentUserSpeech, setCurrentUserSpeech] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCall = async () => {
    setIsConnecting(true);
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: true,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "AI call started. Speak naturally!",
      });

      // Simulate AI greeting
      setTimeout(() => {
        setTranscript(prev => [...prev, {
          role: "assistant",
          content: "Hello! I'm your AI assistant. I can see and hear you. How can I help you today?",
          timestamp: new Date(),
        }]);
      }, 1500);

    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Permission Denied",
        description: "Please allow camera and microphone access to use AI call.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsConnected(false);
    setTranscript([]);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleClose = () => {
    endCall();
    onClose();
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="relative bg-background">
          {/* Video/AI Avatar Area */}
          <div className="relative h-[400px] bg-gradient-to-br from-primary/20 to-secondary/20">
            {isConnected ? (
              <>
                {/* User Video (small overlay) */}
                <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-lg z-10">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                  />
                  {!isVideoEnabled && (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <CameraOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* AI Avatar (main view) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: aiResponse ? [1, 1.05, 1] : 1,
                    }}
                    transition={{ duration: 0.5, repeat: aiResponse ? Infinity : 0 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 rounded-full brand-gradient flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-16 h-16 text-primary-foreground" />
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full brand-gradient opacity-30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>

                {/* Connection Status */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium">Connected</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full brand-gradient flex items-center justify-center mb-4">
                  <Sparkles className="w-12 h-12 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multimodal AI Call</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  Have a real-time conversation with AI that can see through your camera and hear your voice
                </p>
                <Button
                  onClick={startCall}
                  disabled={isConnecting}
                  className="brand-gradient"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5 mr-2" />
                      Start AI Call
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Transcript Area */}
          {isConnected && transcript.length > 0 && (
            <ScrollArea className="h-32 border-t border-border bg-muted/30">
              <div className="p-4 space-y-3">
                {transcript.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "user" ? "bg-primary" : "brand-gradient"
                    }`}>
                      {msg.role === "user" ? (
                        <span className="text-[10px] text-primary-foreground">You</span>
                      ) : (
                        <Sparkles className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className={`max-w-[80%] px-3 py-2 rounded-lg ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background"
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Controls */}
          {isConnected && (
            <div className="flex items-center justify-center gap-4 p-4 bg-background border-t border-border">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                variant={!isVideoEnabled ? "destructive" : "outline"}
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-14 h-14"
                onClick={endCall}
              >
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
