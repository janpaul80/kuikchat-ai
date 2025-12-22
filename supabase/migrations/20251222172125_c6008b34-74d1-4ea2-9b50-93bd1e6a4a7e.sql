-- Create table for WebRTC call signaling
CREATE TABLE public.call_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ringing', 'answered', 'declined', 'ended', 'missed')),
  sdp_offer TEXT,
  sdp_answer TEXT,
  ice_candidates JSONB DEFAULT '[]'::jsonb,
  video_quality TEXT DEFAULT '1080p' CHECK (video_quality IN ('720p', '1080p', '4k')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- Policies for call signals - users can see calls they're part of
CREATE POLICY "Users can view their own calls" 
ON public.call_signals 
FOR SELECT 
USING (auth.uid()::text = caller_id::text OR auth.uid()::text = receiver_id::text);

CREATE POLICY "Users can create calls" 
ON public.call_signals 
FOR INSERT 
WITH CHECK (auth.uid()::text = caller_id::text);

CREATE POLICY "Users can update calls they're part of" 
ON public.call_signals 
FOR UPDATE 
USING (auth.uid()::text = caller_id::text OR auth.uid()::text = receiver_id::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_call_signals_updated_at
BEFORE UPDATE ON public.call_signals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for call signals
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;