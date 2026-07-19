import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message || "Failed to resolve chat");
  }
  return "Failed to resolve chat";
};

export const useChat = () => {
  const { user } = useAuth();
  const [isResolving, setIsResolving] = useState(false);

  const getOrCreateChat = useCallback(async (targetProfileId: string): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to start a chat");
      return null;
    }

    if (targetProfileId === user.id) {
      toast.error("You cannot start a chat with yourself");
      return null;
    }

    setIsResolving(true);

    try {
      // Production already exposes this secure RPC. It derives the caller from auth.uid(),
      // validates the target profile, reuses/creates one direct chat, and writes the two
      // membership rows server-side so the browser never needs a broad chats INSERT grant.
      const { data, error } = await supabase.rpc("upsert_direct_chat", {
        p_other: targetProfileId,
      });

      if (error) throw error;
      if (!data) throw new Error("Chat resolver returned no chat id");
      return data;
    } catch (error) {
      console.error("getOrCreateChat error:", error);
      toast.error(getErrorMessage(error));
      return null;
    } finally {
      setIsResolving(false);
    }
  }, [user]);

  return { getOrCreateChat, isResolving };
};
