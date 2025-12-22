import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff, Video, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WebRTCCall, CallStatus, VideoQuality } from "@/utils/WebRTCCall";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IncomingCallData {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: 'video' | 'audio';
  status: CallStatus;
  sdp_offer: string | null;
  sdp_answer: string | null;
  ice_candidates: any[];
  video_quality: VideoQuality;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
}

interface IncomingCallModalProps {
  callData: IncomingCallData;
  callerName: string;
  callerAvatar?: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onCallConnected: (localStream: MediaStream, remoteStream: MediaStream | null) => void;
}

export const IncomingCallModal = ({
  callData,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
  onCallConnected,
}: IncomingCallModalProps) => {
  const [isAnswering, setIsAnswering] = useState(false);
  const webrtcRef = useRef<WebRTCCall | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Play ringtone
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.loop = true;
    audioRef.current.play().catch(() => {
      // Audio autoplay may be blocked
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleAccept = async () => {
    try {
      setIsAnswering(true);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create WebRTC instance
      webrtcRef.current = new WebRTCCall(
        callData.call_type,
        callData.video_quality
      );

      webrtcRef.current.onLocalStream = (stream) => {
        console.log('[IncomingCall] Local stream received');
        const remoteStream = webrtcRef.current?.getRemoteStream() || null;
        onCallConnected(stream, remoteStream);
      };

      webrtcRef.current.onRemoteStream = (stream) => {
        console.log('[IncomingCall] Remote stream received');
        const localStream = webrtcRef.current?.getLocalStream();
        if (localStream) {
          onCallConnected(localStream, stream);
        }
      };

      webrtcRef.current.onError = (error) => {
        toast({
          title: "Call Error",
          description: error,
          variant: "destructive",
        });
      };

      // Answer the call
      await webrtcRef.current.answerCall(callData);
      
      onAccept();

    } catch (error) {
      console.error('[IncomingCall] Failed to answer:', error);
      toast({
        title: "Failed to Answer",
        description: error instanceof Error ? error.message : "Could not answer call",
        variant: "destructive",
      });
      setIsAnswering(false);
    }
  };

  const handleDecline = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Update call status to declined
    await supabase
      .from('call_signals')
      .update({ status: 'declined' })
      .eq('id', callData.id);

    onDecline();
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-background/95 backdrop-blur-xl">
        <div className="p-8 text-center">
          {/* Animated ring effect */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full brand-gradient"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="absolute inset-0 rounded-full brand-gradient"
            />
            <div className="absolute inset-2 rounded-full overflow-hidden ring-4 ring-primary/50 bg-muted">
              {callerAvatar ? (
                <img
                  src={callerAvatar}
                  alt={callerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
                  {callerName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-1">{callerName}</h3>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            {callData.call_type === 'video' ? (
              <Video className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span>
              Incoming {callData.call_type === 'video' ? 'Video' : 'Voice'} Call
            </span>
          </div>

          {/* Call controls */}
          <div className="flex items-center justify-center gap-8">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="destructive"
                size="icon"
                className="w-16 h-16 rounded-full"
                onClick={handleDecline}
                disabled={isAnswering}
              >
                <PhoneOff className="w-7 h-7" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="icon"
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
                onClick={handleAccept}
                disabled={isAnswering}
              >
                {isAnswering ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Phone className="w-7 h-7" />
                  </motion.div>
                ) : (
                  <Phone className="w-7 h-7" />
                )}
              </Button>
            </motion.div>
          </div>

          {isAnswering && (
            <p className="text-sm text-muted-foreground mt-4 animate-pulse">
              Connecting...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
