import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useChat = () => {
  const { user } = useAuth();
  const [isResolving, setIsResolving] = useState(false);

  const getOrCreateChat = useCallback(async (targetUserId: string): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to start a chat");
      return null;
    }

    if (targetUserId === user.id) {
      toast.error("You cannot start a chat with yourself");
      return null;
    }

    setIsResolving(true);

    try {
      // 1. Find all chats the current user is a member of
      const { data: myMemberships, error: membershipError } = await supabase
        .from("chat_members")
        .select("chat_id")
        .eq("user_id", user.id);

      if (membershipError) throw membershipError;

      if (myMemberships && myMemberships.length > 0) {
        const myChatIds = myMemberships.map(m => m.chat_id);

        // 2. Check if any of these chats also contains the target user
        const { data: targetMemberships, error: targetError } = await supabase
          .from("chat_members")
          .select("chat_id")
          .eq("user_id", targetUserId)
          .in("chat_id", myChatIds);

        if (targetError) throw targetError;

        if (targetMemberships && targetMemberships.length > 0) {
          // We found an existing 1:1 direct chat
          return targetMemberships[0].chat_id;
        }
      }

      // 3. If no existing chat, create a new one
      // Note: To handle race conditions without a DB function/transaction, 
      // we rely on the fact that 'direct' type + logic should minimize collisions,
      // but we acknowledge the limitation as requested.
      const { data: newChat, error: createError } = await supabase
        .from("chats")
        .insert({ type: "direct", created_by: user.id })
        .select()
        .single();

      if (createError) throw createError;

      // 4. Add both participants
      const { error: m1 } = await supabase
        .from("chat_members")
        .insert([{ chat_id: newChat.id, user_id: user.id }]);
      if (m1) throw m1;

      const { error: m2 } = await supabase
        .from("chat_members")
        .insert([{ chat_id: newChat.id, user_id: targetUserId }]);
      if (m2) throw m2;

      return newChat.id;

    } catch (err: any) {
      console.error("getOrCreateChat error:", err);
      toast.error(err.message || "Failed to resolve chat");
      return null;
    } finally {
      setIsResolving(false);
    }
  }, [user]);

  return { getOrCreateChat, isResolving };
};
