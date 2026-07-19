import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
      const { data, error } = await supabase.rpc("get_or_create_direct_chat", {
        target_profile_id: targetProfileId,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("getOrCreateChat error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to resolve chat");
      return null;
    } finally {
      setIsResolving(false);
    }
  }, [user]);

  return { getOrCreateChat, isResolving };
};
