import { supabase } from "@/integrations/supabase/client";

export type CallType = 'video' | 'audio';
export type VideoQuality = '720p' | '1080p' | '4k';
export type CallStatus = 'pending' | 'ringing' | 'answered' | 'declined' | 'ended' | 'missed';

interface CallSignal {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: CallType;
  status: CallStatus;
  sdp_offer: string | null;
  sdp_answer: string | null;
  ice_candidates: any[];
  video_quality: VideoQuality;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
}

const VIDEO_CONSTRAINTS: Record<VideoQuality, MediaTrackConstraints> = {
  '720p': {
    width: { ideal: 1280, max: 1280 },
    height: { ideal: 720, max: 720 },
    frameRate: { ideal: 30, max: 30 }
  },
  '1080p': {
    width: { ideal: 1920, max: 1920 },
    height: { ideal: 1080, max: 1080 },
    frameRate: { ideal: 30, max: 60 }
  },
  '4k': {
    width: { ideal: 3840, max: 3840 },
    height: { ideal: 2160, max: 2160 },
    frameRate: { ideal: 30, max: 60 }
  }
};

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export class WebRTCCall {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private channelSubscription: any = null;
  
  public onRemoteStream: ((stream: MediaStream) => void) | null = null;
  public onLocalStream: ((stream: MediaStream) => void) | null = null;
  public onCallStatusChange: ((status: CallStatus) => void) | null = null;
  public onError: ((error: string) => void) | null = null;
  public onConnectionStateChange: ((state: RTCPeerConnectionState) => void) | null = null;

  constructor(
    private callType: CallType,
    private videoQuality: VideoQuality = '1080p'
  ) {}

  private async getMediaStream(): Promise<MediaStream> {
    const audioConstraints: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 2
    };

    const constraints: MediaStreamConstraints = {
      audio: audioConstraints,
      video: this.callType === 'video' ? VIDEO_CONSTRAINTS[this.videoQuality] : false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[WebRTC] Got local media stream', {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });
      return stream;
    } catch (error) {
      console.error('[WebRTC] Failed to get media stream:', error);
      throw new Error('Failed to access camera/microphone. Please check permissions.');
    }
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10
    });

    pc.onicecandidate = async (event) => {
      if (event.candidate && this.callId) {
        console.log('[WebRTC] ICE candidate:', event.candidate.type);
        // Add ICE candidate to database
        const { data: callData } = await supabase
          .from('call_signals')
          .select('ice_candidates')
          .eq('id', this.callId)
          .single();
        
        if (callData) {
          const existingCandidates = Array.isArray(callData.ice_candidates) 
            ? callData.ice_candidates 
            : [];
          const candidateJson = JSON.parse(JSON.stringify(event.candidate.toJSON()));
          const candidates = [...existingCandidates, candidateJson];
          
          await supabase
            .from('call_signals')
            .update({ ice_candidates: candidates as any })
            .eq('id', this.callId);
        }
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      this.remoteStream.addTrack(event.track);
      this.onRemoteStream?.(this.remoteStream);
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      this.onConnectionStateChange?.(pc.connectionState);
      
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.onError?.('Connection lost. Please try again.');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
    };

    return pc;
  }

  async initiateCall(callerId: string, receiverId: string): Promise<string> {
    try {
      console.log('[WebRTC] Initiating call from', callerId, 'to', receiverId);
      
      // Get local media stream
      this.localStream = await this.getMediaStream();
      this.onLocalStream?.(this.localStream);

      // Create peer connection
      this.pc = this.createPeerConnection();

      // Add local tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        console.log('[WebRTC] Adding local track:', track.kind);
        this.pc!.addTrack(track, this.localStream!);
      });

      // Create offer
      const offer = await this.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.callType === 'video'
      });
      await this.pc.setLocalDescription(offer);
      console.log('[WebRTC] Created offer');

      // Save call signal to database
      const { data: callSignal, error } = await supabase
        .from('call_signals')
        .insert({
          caller_id: callerId,
          receiver_id: receiverId,
          call_type: this.callType,
          video_quality: this.videoQuality,
          sdp_offer: JSON.stringify(offer),
          status: 'ringing'
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create call signal: ' + error.message);
      }

      this.callId = callSignal.id;
      console.log('[WebRTC] Call signal created:', this.callId);

      // Subscribe to call updates
      this.subscribeToCallUpdates();

      return this.callId;
    } catch (error) {
      console.error('[WebRTC] Failed to initiate call:', error);
      this.cleanup();
      throw error;
    }
  }

  async answerCall(callSignal: CallSignal): Promise<void> {
    try {
      console.log('[WebRTC] Answering call:', callSignal.id);
      this.callId = callSignal.id;
      this.callType = callSignal.call_type as CallType;
      this.videoQuality = callSignal.video_quality as VideoQuality;

      // Get local media stream
      this.localStream = await this.getMediaStream();
      this.onLocalStream?.(this.localStream);

      // Create peer connection
      this.pc = this.createPeerConnection();

      // Add local tracks
      this.localStream.getTracks().forEach(track => {
        console.log('[WebRTC] Adding local track:', track.kind);
        this.pc!.addTrack(track, this.localStream!);
      });

      // Set remote description from offer
      const offer = JSON.parse(callSignal.sdp_offer!);
      await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('[WebRTC] Set remote description from offer');

      // Add any existing ICE candidates
      if (callSignal.ice_candidates?.length > 0) {
        for (const candidate of callSignal.ice_candidates) {
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }

      // Create answer
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      console.log('[WebRTC] Created answer');

      // Update call signal with answer
      await supabase
        .from('call_signals')
        .update({
          sdp_answer: JSON.stringify(answer),
          status: 'answered'
        })
        .eq('id', this.callId);

      // Subscribe to updates
      this.subscribeToCallUpdates();

      this.onCallStatusChange?.('answered');
    } catch (error) {
      console.error('[WebRTC] Failed to answer call:', error);
      this.cleanup();
      throw error;
    }
  }

  private subscribeToCallUpdates(): void {
    if (!this.callId) return;

    console.log('[WebRTC] Subscribing to call updates for:', this.callId);

    this.channelSubscription = supabase
      .channel(`call-${this.callId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_signals',
          filter: `id=eq.${this.callId}`
        },
        async (payload) => {
          const updatedCall = payload.new as CallSignal;
          console.log('[WebRTC] Call signal updated:', updatedCall.status);

          // Handle status changes
          this.onCallStatusChange?.(updatedCall.status as CallStatus);

          if (updatedCall.status === 'ended' || updatedCall.status === 'declined') {
            this.cleanup();
            return;
          }

          // Handle answer received (for caller)
          if (updatedCall.sdp_answer && this.pc && !this.pc.remoteDescription) {
            const answer = JSON.parse(updatedCall.sdp_answer);
            await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('[WebRTC] Set remote description from answer');
          }

          // Handle new ICE candidates
          if (updatedCall.ice_candidates?.length > 0 && this.pc) {
            const currentCount = this.pc.remoteDescription ? 
              updatedCall.ice_candidates.length : 0;
            
            for (let i = 0; i < updatedCall.ice_candidates.length; i++) {
              try {
                const candidate = new RTCIceCandidate(updatedCall.ice_candidates[i]);
                await this.pc.addIceCandidate(candidate);
              } catch (e) {
                // Candidate may already be added
              }
            }
          }
        }
      )
      .subscribe();
  }

  async endCall(): Promise<void> {
    console.log('[WebRTC] Ending call:', this.callId);
    
    if (this.callId) {
      await supabase
        .from('call_signals')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', this.callId);
    }

    this.cleanup();
    this.onCallStatusChange?.('ended');
  }

  async declineCall(callId: string): Promise<void> {
    console.log('[WebRTC] Declining call:', callId);
    
    await supabase
      .from('call_signals')
      .update({ status: 'declined' })
      .eq('id', callId);
  }

  toggleMute(): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('[WebRTC] Audio muted:', !audioTrack.enabled);
      return !audioTrack.enabled;
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('[WebRTC] Video disabled:', !videoTrack.enabled);
      return !videoTrack.enabled;
    }
    return false;
  }

  private cleanup(): void {
    console.log('[WebRTC] Cleaning up');
    
    if (this.channelSubscription) {
      supabase.removeChannel(this.channelSubscription);
      this.channelSubscription = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.callId = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}

// Hook to listen for incoming calls
export const subscribeToIncomingCalls = (
  userId: string,
  onIncomingCall: (call: CallSignal) => void
) => {
  console.log('[WebRTC] Subscribing to incoming calls for user:', userId);
  
  const channel = supabase
    .channel('incoming-calls')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'call_signals',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => {
        const call = payload.new as CallSignal;
        if (call.status === 'ringing') {
          console.log('[WebRTC] Incoming call:', call.id);
          onIncomingCall(call);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
