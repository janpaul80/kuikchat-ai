import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, MessageCircle, Users, Phone, Store, EyeOff, LogOut, Plus, MessageSquare, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAiChat } from "@/hooks/useAiChat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export type SidebarView = "Chats" | "Status" | "Calls" | "Communities" | "Vanish Mode" | "Settings" | "Hidden" | "Business" | "Hermes AI";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

const navItems: { icon: any; label: SidebarView }[] = [
  { icon: MessageCircle, label: "Chats" },
  { icon: Sparkles, label: "Hermes AI" },
  { icon: CircleDot, label: "Status" },
  { icon: Phone, label: "Calls" },
  { icon: Users, label: "Communities" },
  { icon: Store, label: "Business" },
  { icon: EyeOff, label: "Vanish Mode" },
];

export const ChatSidebar = ({ activeView, onViewChange }: { activeView: SidebarView, onViewChange: (v: SidebarView) => void }) => {
  const { signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { startNewChat, loadConversation } = useAiChat();

  useEffect(() => {
    if (activeView === "Hermes AI") {
      fetchConversations();
    }
  }, [activeView]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    await startNewChat();
    setActiveConversationId(null);
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    await loadConversation(id);
  };

  return (
    <aside className="hidden md:flex w-72 h-full bg-card border-r border-border flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>KuikChat</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {activeView === "Hermes AI" && (
            <>
              <Button onClick={handleNewChat} variant="secondary" className="w-full justify-start gap-2 mb-4">
                <Plus className="w-4 h-4" /> New Chat
              </Button>
              <p className="text-xs font-medium text-muted-foreground px-2 py-2 uppercase tracking-wider">History</p>
              {loading ? (
                <div className="px-2 py-4 text-xs text-muted-foreground italic">Loading...</div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activeConversationId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="truncate w-full text-left">{conv.title || "Untitled Chat"}</span>
                      <span className="text-[10px] opacity-60">{format(new Date(conv.updated_at), "MMM d, h:mm a")}</span>
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              activeView === item.label ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => signOut()}>
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </aside>
  );
};
