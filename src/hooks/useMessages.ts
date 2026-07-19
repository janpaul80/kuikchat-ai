import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: "text" | "image" | "video" | string;
  is_read?: boolean | null;
  created_at: string;
}

export const useMessages = (chatId: string | null | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!user || !chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast({ title: "Error", description: "Could not load messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, chatId, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!user || !chatId) return;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, chatId]);

  const sendMessage = async (content: string) => {
    if (!user || !chatId || !content.trim()) return null;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim(),
          type: "text",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    } catch (err) {
      console.error("Error sending message:", err);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      return null;
    }
  };

  const markAsRead = async () => {
    if (!user || !chatId) return;

    const { error } = await supabase
      .from("chat_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating read state:", error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
};
