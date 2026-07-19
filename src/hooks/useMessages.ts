import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  body?: string | null;
  type: "text" | "image" | "video" | string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

type DbMessage = Omit<Message, "content"> & {
  content?: string | null;
  body?: string | null;
};

const normalizeMessage = (message: DbMessage): Message => ({
  ...message,
  content: message.content ?? message.body ?? "",
});

const describeMessageError = (operation: string, error: unknown, chatId?: string, userId?: string) => {
  const candidate = error as { status?: number; code?: string; message?: string; details?: string; hint?: string };
  console.error("[messages]", {
    operation,
    ok: false,
    table: "messages",
    status: candidate?.status,
    code: candidate?.code,
    message: candidate?.message,
    hint: candidate?.hint,
    chatId,
    userId,
  });
};

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
      const { data, error, status } = await supabase
        .from("messages")
        .select("id,chat_id,sender_id,body,type,metadata,created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw { ...error, status };
      setMessages(((data || []) as DbMessage[]).map(normalizeMessage));
    } catch (err) {
      describeMessageError("fetch_messages", err, chatId, user.id);
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
          const newMessage = normalizeMessage(payload.new as DbMessage);
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
      const { data, error, status } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          body: content.trim(),
          type: "text",
        })
        .select("id,chat_id,sender_id,body,type,metadata,created_at")
        .single();

      if (error) throw { ...error, status };
      return normalizeMessage(data as DbMessage);
    } catch (err) {
      describeMessageError("send_message", err, chatId, user.id);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      return null;
    }
  };

  const markAsRead = async () => {
    if (!user || !chatId) return;

    const { error, status } = await supabase
      .from("chat_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[chat_members]", {
        operation: "update_last_read_at",
        ok: false,
        table: "chat_members",
        status,
        code: error.code,
        message: error.message,
        chatId,
        userId: user.id,
      });
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
