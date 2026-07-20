import { useState, useCallback } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ChatResolveOperation =
  | "authenticated_session_lookup"
  | "current_profile_lookup"
  | "target_profile_lookup"
  | "secure_rpc_upsert_direct_chat"
  | "membership_verification"
  | "final_chat_access_check";

interface ChatResolveDebugEntry {
  operation: ChatResolveOperation;
  ok: boolean;
  status?: number;
  code?: string;
  message?: string;
  table?: string;
  currentAuthUserId?: string;
  currentProfileId?: string;
  targetProfileId?: string;
  chatId?: string;
}

const redactMessage = (message: unknown) => {
  if (!message) return undefined;
  return String(message)
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[jwt-redacted]");
};

const describeSupabaseError = (error: unknown) => {
  const candidate = error as Partial<PostgrestError> & { status?: number };
  return {
    status: candidate?.status,
    code: candidate?.code,
    message: redactMessage(candidate?.message || (error instanceof Error ? error.message : String(error || "Unknown error"))),
  };
};

const logStep = (entry: ChatResolveDebugEntry) => {
  const safeEntry = { ...entry, message: redactMessage(entry.message) };
  if (entry.ok) {
    console.info("[chat-resolver]", safeEntry);
  } else {
    console.error("[chat-resolver]", safeEntry);
  }
};

const safeToastForFailure = (operation: ChatResolveOperation, code?: string) => {
  const suffix = code ? ` (${code})` : "";
  switch (operation) {
    case "authenticated_session_lookup":
      return `Chat unavailable: sign in again${suffix}`;
    case "current_profile_lookup":
      return `Chat unavailable: your profile could not be verified${suffix}`;
    case "target_profile_lookup":
      return `Chat unavailable: contact profile could not be verified${suffix}`;
    case "secure_rpc_upsert_direct_chat":
      return `Chat unavailable: secure chat creation failed${suffix}`;
    case "membership_verification":
      return `Chat unavailable: membership verification failed${suffix}`;
    case "final_chat_access_check":
      return `Chat unavailable: final chat access check failed${suffix}`;
    default:
      return `Chat unavailable${suffix}`;
  }
};

export const useChat = () => {
  const { user } = useAuth();
  const [isResolving, setIsResolving] = useState(false);

  const getOrCreateChat = useCallback(async (targetProfileId: string): Promise<string | null> => {
    setIsResolving(true);

    let currentAuthUserId = user?.id;
    let currentProfileId: string | undefined;
    let chatId: string | undefined;

    const fail = (operation: ChatResolveOperation, error: unknown, extras: Partial<ChatResolveDebugEntry> = {}) => {
      const details = describeSupabaseError(error);
      logStep({
        operation,
        ok: false,
        ...details,
        currentAuthUserId,
        currentProfileId,
        targetProfileId,
        chatId,
        table: extras.table,
        ...extras,
      });
      toast.error(safeToastForFailure(operation, details.code));
      return null;
    };

    try {
      const sessionResult = await supabase.auth.getSession();
      if (sessionResult.error || !sessionResult.data.session?.user) {
        return fail("authenticated_session_lookup", sessionResult.error || new Error("No authenticated Supabase session"));
      }

      currentAuthUserId = sessionResult.data.session.user.id;
      logStep({ operation: "authenticated_session_lookup", ok: true, currentAuthUserId, targetProfileId });

      const currentProfileResult = await supabase
        .from("profiles")
        .select("id")
        .eq("id", currentAuthUserId)
        .maybeSingle();

      if (currentProfileResult.error) {
        return fail("current_profile_lookup", currentProfileResult.error, {
          table: "profiles",
          status: currentProfileResult.status,
        });
      }

      if (!currentProfileResult.data?.id) {
        const metadata = sessionResult.data.session.user.user_metadata || {};
        const fallbackName =
          typeof metadata.full_name === "string" ? metadata.full_name :
          typeof metadata.name === "string" ? metadata.name :
          sessionResult.data.session.user.email?.split("@")[0] || "KuikChat User";

        const createProfileResult = await supabase
          .from("profiles")
          .insert({
            id: currentAuthUserId,
            display_name: fallbackName,
            bio: "Hey there! I'm using KuikChat",
          })
          .select("id")
          .single();

        if (createProfileResult.error || !createProfileResult.data?.id) {
          return fail("current_profile_lookup", createProfileResult.error || new Error("Authenticated profile is missing and could not be created"), {
            table: "profiles",
            status: createProfileResult.status,
          });
        }

        currentProfileId = createProfileResult.data.id;
      } else {
        currentProfileId = currentProfileResult.data.id;
      }

      logStep({ operation: "current_profile_lookup", ok: true, currentAuthUserId, currentProfileId, targetProfileId, table: "profiles" });

      if (targetProfileId === currentProfileId) {
        return fail("target_profile_lookup", new Error("Cannot start a direct chat with yourself"));
      }

      const targetProfileResult = await supabase
        .from("profiles")
        .select("id")
        .eq("id", targetProfileId)
        .maybeSingle();

      if (targetProfileResult.error || !targetProfileResult.data?.id) {
        return fail("target_profile_lookup", targetProfileResult.error || new Error("Target profile not found or not visible"), {
          table: "profiles",
          status: targetProfileResult.status,
        });
      }

      logStep({ operation: "target_profile_lookup", ok: true, currentAuthUserId, targetProfileId, table: "profiles" });

      const rpcResult = await supabase.rpc("upsert_direct_chat", {
        p_other: targetProfileId,
      });

      if (rpcResult.error || !rpcResult.data) {
        return fail("secure_rpc_upsert_direct_chat", rpcResult.error || new Error("RPC returned no chat id"), {
          status: rpcResult.status,
        });
      }

      chatId = String(rpcResult.data);

      logStep({ operation: "secure_rpc_upsert_direct_chat", ok: true, currentAuthUserId, currentProfileId, targetProfileId, chatId });

      const memberResult = await supabase
        .from("chat_members")
        .select("chat_id,user_id")
        .eq("chat_id", chatId)
        .in("user_id", [currentProfileId, targetProfileId]);

      if (memberResult.error || (memberResult.data || []).length !== 2) {
        return fail("membership_verification", memberResult.error || new Error(`Expected 2 chat_members rows, found ${(memberResult.data || []).length}`), {
          table: "chat_members",
          status: memberResult.status,
        });
      }

      logStep({ operation: "membership_verification", ok: true, currentAuthUserId, currentProfileId, targetProfileId, chatId, table: "chat_members" });

      const chatAccessResult = await supabase
        .from("chats")
        .select("id,type,created_by")
        .eq("id", chatId)
        .eq("type", "direct")
        .maybeSingle();

      if (chatAccessResult.error || !chatAccessResult.data?.id) {
        return fail("final_chat_access_check", chatAccessResult.error || new Error("Created/reused direct chat is not readable by current user"), {
          table: "chats",
          status: chatAccessResult.status,
        });
      }

      logStep({ operation: "final_chat_access_check", ok: true, currentAuthUserId, currentProfileId, targetProfileId, chatId, table: "chats" });
      return chatId;
    } catch (error) {
      return fail("secure_rpc_upsert_direct_chat", error);
    } finally {
      setIsResolving(false);
    }
  }, [user]);

  return { getOrCreateChat, isResolving };
};
