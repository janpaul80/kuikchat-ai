import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  Sparkles,
  Settings2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ARLensSelector, ARLens } from "./ARLensSelector";
import { WebRTCCall, VideoQuality, CallStatus } from "@/utils/WebRTCCall";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface VideoCallModalProps {
  open: boolean;
  onClose: () => void;
  contact: {
    name: string;
    avatar_url?: string | null;
    avatar: string;
    user_id: string;
  };
  isVideoCall: boolean;
}

export const VideoCallModal = ({
  open,
  onClose,
  contact,
  isVideoCall,
}: VideoCallModalProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [showARLenses, setShowARLenses] = useState(false);
  const [selectedLens, setSelectedLens] = useState<ARLens | null>(null);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("1080p");
  const [showSettings, setShowSettings] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("new");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const webrtcRef = useRef<WebRTCCall | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize WebRTC call
  useEffect(() => {
    if (!open || !user) return;

    const initCall = async () => {
      try {
        setCallStatus("connecting");
        
        // Create WebRTC call instance
        webrtcRef.current = new WebRTCCall(
          isVideoCall ? 'video' : 'audio',
          videoQuality
        );

        // Set up callbacks
        webrtcRef.current.onLocalStream = (stream) => {
          console.log('[VideoCallModal] Local stream received');
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        };

        webrtcRef.current.onRemoteStream = (stream) => {
          console.log('[VideoCallModal] Remote stream received');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        };

        webrtcRef.current.onCallStatusChange = (status: CallStatus) => {
          console.log('[VideoCallModal] Call status changed:', status);
          if (status === 'answered') {
            setCallStatus('connected');
            toast({
              title: "Connected",
              description: `${contact.name} answered the call`,
            });
          } else if (status === 'declined') {
            toast({
              title: "Call Declined",
              description: `${contact.name} declined the call`,
              variant: "destructive",
            });
            handleEndCall();
          } else if (status === 'ended') {
            handleEndCall();
          }
        };

        webrtcRef.current.onConnectionStateChange = (state) => {
          console.log('[VideoCallModal] Connection state:', state);
          setConnectionState(state);
          
          if (state === 'connected') {
            setCallStatus('connected');
          } else if (state === 'failed') {
            toast({
              title: "Connection Failed",
              description: "Could not establish connection. Please try again.",
              variant: "destructive",
            });
            handleEndCall();
          }
        };

        webrtcRef.current.onError = (error) => {
          console.error('[VideoCallModal] Error:', error);
          toast({
            title: "Call Error",
            description: error,
            variant: "destructive",
          });
        };

        // Initiate the call
        await webrtcRef.current.initiateCall(user.id, contact.user_id);
        setCallStatus("ringing");
        
        toast({
          title: isVideoCall ? "Video Call" : "Voice Call",
          description: `Calling ${contact.name}...`,
        });

      } catch (error) {
        console.error('[VideoCallModal] Failed to initialize call:', error);
        toast({
          title: "Call Failed",
          description: error instanceof Error ? error.message : "Could not start call",
          variant: "destructive",
        });
        onClose();
      }
    };

    initCall();

    return () => {
      if (webrtcRef.current) {
        webrtcRef.current.endCall();
        webrtcRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [open, user, contact.user_id, isVideoCall, videoQuality]);

  // Call duration timer
  useEffect(() => {
    if (callStatus === "connected") {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  // AR Lens rendering
  const renderARLens = () => {
    if (!canvasRef.current || !localVideoRef.current || !selectedLens) return;
    
    const canvas = canvasRef.current;
    const video = localVideoRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      if (selectedLens) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 3;
        
        ctx.font = `${canvas.width / 5}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(selectedLens.emoji, centerX, centerY);
        
        ctx.shadowColor = selectedLens.color;
        ctx.shadowBlur = 20;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  useEffect(() => {
    if (selectedLens && isVideoEnabled) {
      renderARLens();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [selectedLens, isVideoEnabled]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    if (webrtcRef.current) {
      webrtcRef.current.endCall();
      webrtcRef.current = null;
    }
    setTimeout(onClose, 500);
  };

  const toggleMute = () => {
    if (webrtcRef.current) {
      const muted = webrtcRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const toggleVideo = () => {
    if (webrtcRef.current) {
      const disabled = webrtcRef.current.toggleVideo();
      setIsVideoEnabled(!disabled);
    }
  };

  const getQualityLabel = (quality: VideoQuality): string => {
    switch (quality) {
      case '720p': return 'HD (720p)';
      case '1080p': return 'Full HD (1080p)';
      case '4k': return '4K Ultra HD';
      default: return quality;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleEndCall()}>
      <DialogContent className={`${isFullscreen ? "max-w-full h-screen" : "max-w-2xl"} p-0 overflow-hidden bg-background/95 backdrop-blur-xl`}>
        <div className="relative flex flex-col h-full min-h-[500px]">
          {/* Remote Video */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
            {callStatus === "connecting" || callStatus === "ringing" ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-primary/50"
                >
                  {contact.avatar_url ? (
                    <img
                      src={contact.avatar_url}
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center text-4xl font-bold">
                      {contact.avatar}
                    </div>
                  )}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{contact.name}</h3>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="animate-pulse">
                    {callStatus === "ringing" ? "Ringing..." : "Connecting..."}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {getQualityLabel(videoQuality)}
                </p>
              </motion.div>
            ) : (
              <div className="relative w-full h-full">
                {/* Remote video stream */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Fallback avatar if no remote video */}
                {!remoteVideoRef.current?.srcObject && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-secondary/50">
                      {contact.avatar_url ? (
                        <img
                          src={contact.avatar_url}
                          alt={contact.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center text-6xl font-bold">
                          {contact.avatar}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Call info overlay */}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-secondary">{formatDuration(callDuration)}</p>
                  <p className="text-xs text-muted-foreground">{getQualityLabel(videoQuality)}</p>
                </div>

                {/* Connection state indicator */}
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionState === 'connected' ? 'bg-green-500' :
                      connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                      'bg-red-500'
                    }`} />
                    <span className="text-xs capitalize">{connectionState}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Local Video Preview */}
          {isVideoEnabled && callStatus === "connected" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-24 right-4 w-32 h-44 rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary/50"
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={selectedLens ? "hidden" : "w-full h-full object-cover mirror"}
              />
              {selectedLens && (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          )}

          {/* Video Quality Settings */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-24 left-4 bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-xl"
              >
                <h4 className="text-sm font-semibold mb-3">Video Quality</h4>
                <Select
                  value={videoQuality}
                  onValueChange={(v) => setVideoQuality(v as VideoQuality)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">HD (720p)</SelectItem>
                    <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                    <SelectItem value="4k">4K Ultra HD</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Higher quality uses more bandwidth
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AR Lens Selector */}
          <AnimatePresence>
            {showARLenses && isVideoEnabled && (
              <ARLensSelector
                selectedLens={selectedLens}
                onSelectLens={setSelectedLens}
                onClose={() => setShowARLenses(false)}
              />
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`w-14 h-14 rounded-full ${isMuted ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`w-14 h-14 rounded-full ${!isVideoEnabled ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>

              {isVideoEnabled && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-14 h-14 rounded-full ${showARLenses ? "brand-gradient text-primary-foreground" : "bg-muted"}`}
                    onClick={() => setShowARLenses(!showARLenses)}
                  >
                    <Sparkles className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-14 h-14 rounded-full ${showSettings ? "brand-gradient text-primary-foreground" : "bg-muted"}`}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings2 className="w-6 h-6" />
                  </Button>
                </>
              )}

              <Button
                variant="destructive"
                size="icon"
                className="w-16 h-16 rounded-full"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-7 h-7" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-14 h-14 rounded-full bg-muted"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
