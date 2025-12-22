-- Add reply_to_id column for reply threads
ALTER TABLE public.messages 
ADD COLUMN reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- Create scheduled_messages table for scheduling and recurring messages
CREATE TABLE public.scheduled_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  repeat_type TEXT CHECK (repeat_type IN ('once', 'daily', 'weekly', 'monthly')),
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own scheduled messages
CREATE POLICY "Users can view their own scheduled messages" 
ON public.scheduled_messages 
FOR SELECT 
USING (auth.uid() = sender_id);

-- Users can create their own scheduled messages
CREATE POLICY "Users can create their own scheduled messages" 
ON public.scheduled_messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Users can update their own scheduled messages
CREATE POLICY "Users can update their own scheduled messages" 
ON public.scheduled_messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

-- Users can delete their own scheduled messages
CREATE POLICY "Users can delete their own scheduled messages" 
ON public.scheduled_messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scheduled_messages_updated_at
BEFORE UPDATE ON public.scheduled_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();