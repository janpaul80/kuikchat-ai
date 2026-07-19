import { useState } from "react";
import { Search, Plus, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUsers, UserProfile } from "@/hooks/useUsers";
import { useChat } from "@/hooks/useChat";
import type { ChatContact } from "./ChatWindow";

interface ContactListProps {
  contacts: ChatContact[];
  selectedContact: ChatContact | null;
  onSelectContact: (contact: ChatContact) => void;
  loading?: boolean;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const ContactList = ({ contacts, selectedContact, onSelectContact, loading }: ContactListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const { getOrCreateChat, isResolving } = useChat();
  const { users: allUsers, loading: usersLoading } = useUsers();

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const availableUsers = allUsers.filter((user) =>
    (user.display_name || "Unknown User").toLowerCase().includes(newChatSearch.toLowerCase()),
  );

  const buildContact = (profile: UserProfile, chatId: string): ChatContact => {
    const name = profile.display_name || "Unknown User";
    return {
      id: chatId,
      chat_id: chatId,
      user_id: profile.id,
      name,
      avatar: getInitials(name) || "U",
      avatar_url: profile.avatar_url,
      online: false,
      verified: undefined,
      time: "",
      lastMessage: "",
      unread: 0,
      about: profile.bio || "Hey there! I'm using KuikChat",
    };
  };

  const resolveAndSelectContact = async (contact: ChatContact) => {
    const chatId = contact.chat_id || await getOrCreateChat(contact.user_id);
    if (!chatId) return;
    onSelectContact({ ...contact, id: chatId, chat_id: chatId });
  };

  const handleStartChat = async (profile: UserProfile) => {
    const chatId = await getOrCreateChat(profile.id);
    if (!chatId) return;

    setNewChatOpen(false);
    onSelectContact(buildContact(profile, chatId));
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Chats</h1>
            <p className="text-xs text-muted-foreground">Secure business messaging</p>
          </div>
          <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full brand-gradient text-primary-foreground">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Start a direct chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={newChatSearch}
                    onChange={(event) => setNewChatSearch(event.target.value)}
                    placeholder="Search people"
                    className="pl-9"
                  />
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading people...
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      <UserPlus className="mx-auto mb-2 h-6 w-6" />
                      No matching users found.
                    </div>
                  ) : (
                    availableUsers.map((profile) => {
                      const name = profile.display_name || "Unknown User";
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => handleStartChat(profile)}
                          disabled={isResolving}
                          className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted disabled:opacity-60"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(name) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {profile.bio || "Hey there! I'm using KuikChat"}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search chats"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading chats...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="m-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No chats yet. Tap + to start a conversation.
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <button
              key={`${contact.chat_id || contact.id}-${contact.user_id}`}
              type="button"
              onClick={() => resolveAndSelectContact(contact)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
                selectedContact?.chat_id === contact.chat_id && selectedContact?.user_id === contact.user_id
                  ? "bg-primary/10"
                  : "hover:bg-muted/70"
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar_url || undefined} />
                <AvatarFallback>{contact.avatar || getInitials(contact.name) || "U"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{contact.name}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{contact.time}</span>
                </div>
                <p className="truncate text-sm text-muted-foreground">{contact.lastMessage || contact.about}</p>
              </div>
              {contact.unread > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {contact.unread}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
