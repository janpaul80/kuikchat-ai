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

const isMissingRpcError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code || "")
    : "";

  return (
    code === "PGRST202" ||
    message.includes("get_or_create_direct_chat") ||
    message.includes("could not find the function") ||
    message.includes("schema cache")
  );
};

export const useChat = () => {
  const { user } = useAuth();
  const [isResolving, setIsResolving] = useState(false);

  const getOrCreateChatFallback = useCallback(async (targetProfileId: string): Promise<string> => {
    const { data: myMemberships, error: membershipError } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("user_id", user!.id);

    if (membershipError) throw membershipError;

    const myChatIds = (myMemberships || []).map((membership) => membership.chat_id);

    if (myChatIds.length > 0) {
      const { data: targetMemberships, error: targetError } = await supabase
        .from("chat_members")
        .select("chat_id")
        .eq("user_id", targetProfileId)
        .in("chat_id", myChatIds);

      if (targetError) throw targetError;

      if (targetMemberships && targetMemberships.length > 0) {
        return targetMemberships[0].chat_id;
      }
    }

    const { data: newChat, error: createError } = await supabase
      .from("chats")
      .insert({ type: "direct", created_by: user!.id })
      .select("id")
      .single();

    if (createError) throw createError;

    const { error: membersError } = await supabase
      .from("chat_members")
      .upsert(
        [
          { chat_id: newChat.id, user_id: user!.id, role: "member" },
          { chat_id: newChat.id, user_id: targetProfileId, role: "member" },
        ],
        { onConflict: "chat_id,user_id" },
      );

    if (membersError) throw membersError;

    return newChat.id;
  }, [user]);

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
      if (!data) throw new Error("Chat resolver returned no chat id");
      return data;
    } catch (rpcError) {
      if (!isMissingRpcError(rpcError)) {
        console.error("getOrCreateChat RPC error:", rpcError);
        toast.error(getErrorMessage(rpcError));
        return null;
      }

      try {
        console.warn("get_or_create_direct_chat RPC unavailable; using direct table fallback.", rpcError);
        return await getOrCreateChatFallback(targetProfileId);
      } catch (fallbackError) {
        console.error("getOrCreateChat fallback error:", fallbackError);
        toast.error(getErrorMessage(fallbackError));
        return null;
      }
    } finally {
      setIsResolving(false);
    }
  }, [getOrCreateChatFallback, user]);

  return { getOrCreateChat, isResolving };
};
