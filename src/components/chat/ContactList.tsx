import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Filter, Loader2, UserPlus } from "lucide-react";
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
import type { ChatContact } from "./ChatWindow";
import { VerifiedBadge, VerificationType } from "./VerifiedBadge";

interface ContactListProps {
  contacts: ChatContact[];
  selectedContact: ChatContact | null;
  onSelectContact: (contact: ChatContact) => void;
  loading?: boolean;
}

export const ContactList = ({ contacts, selectedContact, onSelectContact, loading }: ContactListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const { users: allUsers, loading: usersLoading } = useUsers();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users that are not already in contacts
  const contactUserIds = contacts.map(c => c.user_id);
  const availableUsers = allUsers.filter(
    user => !contactUserIds.includes(user.id) &&
    user.display_name?.toLowerCase().includes(newChatSearch.toLowerCase())
  );

  const handleStartChat = (user: UserProfile) => {
    const newContact: ChatContact = {
      id: user.id,
      user_id: user.id,
      name: user.display_name || "Unknown",
      avatar: (user.display_name || "U").charAt(0).toUpperCase(),
      avatar_url: user.avatar_url,
      lastMessage: "",
      time: "Now",
      unread: 0,
      online: false,
      about: user.bio || "Hey there! I'm using KuikChat",
    };
    onSelectContact(newContact);
    setNewChatOpen(false);
    setNewChatSearch("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Filter className="w-5 h-5" />
            </Button>
            
            {/* New Chat Dialog */}
            <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full brand-gradient text-primary-foreground">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Start New Chat
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={newChatSearch}
                      onChange={(e) => setNewChatSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : availableUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No users found</p>
                        <p className="text-sm">Invite friends to join KuikChat!</p>
                      </div>
                    ) : (
                      availableUsers.map((user) => (
                        <motion.button
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleStartChat(user)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-muted-foreground/20">
                              {(user.display_name || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.display_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.bio}</p>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-muted/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p>No contacts found</p>
            <p className="text-sm">Invite friends to start chatting</p>
          </div>
        ) : (
          filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectContact(contact)}
              className={`relative p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedContact?.id === contact.id ? "bg-muted" : ""
              }`}
            >
              {/* About tooltip bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                whileHover={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute -top-8 left-14 glass rounded-lg px-3 py-1.5 text-xs z-10 whitespace-nowrap pointer-events-none"
              >
                {contact.about}
                <div className="absolute -bottom-1 left-4 w-2 h-2 glass rotate-45" />
              </motion.div>

              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contact.avatar_url || undefined} />
                    <AvatarFallback className={`${
                      contact.id === "ai" ? "brand-gradient text-primary-foreground" : "bg-muted-foreground/20 text-foreground"
                    }`}>
                      {contact.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary rounded-full border-2 border-card" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <h3 className="font-semibold truncate">{contact.name}</h3>
                      {contact.verified && <VerifiedBadge type={contact.verified} size="sm" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{contact.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <span className="ml-2 min-w-5 h-5 rounded-full brand-gradient text-primary-foreground text-xs flex items-center justify-center font-medium">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
