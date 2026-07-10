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
  const { getOrCreateChat, isResolving } = useChat();
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

  const handleStartChat = async (user: UserProfile) => {
    const chatId = await getOrCreateChat(user.id);
    if (chatId) {
      const newContact: ChatContact = {
        id: chatId,
        user_id: user.id,
        name: user.display_name || "Unknown",
        avatar: (user.display_name || "U").charAt(0).toUpperCase(),
        avatar_url: user.avatar_url,
        online: false,
        verified: undefined,
        time: "",
        lastMessage: "",
        unread: 0,
        about: user.bio || "Hey there! I'm using KuikChat",
      };
      setNewChatOpen(false);
      onSelectContact(newContact);
    }
  };