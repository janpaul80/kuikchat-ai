import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const useMessages = 
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchMessages = useCallback(async () => {
        if (!user || !chatId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("chat_id", chatId)
                .order("created_at", { ascending: true });
            
            if (error) throw error;
            setMessages(data || []);
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
                    // Prevent duplicates
                    setMessages((prev) => {
                        if (prev.find((m) => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });
                }
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
                    type: "text"
                })
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (err) {
            console.error("Error sending message:", err);
            toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
            return null;
        }
    };

  const markAsRead = async () => {