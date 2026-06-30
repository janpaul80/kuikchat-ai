import { useState } from "react";
import { ChatSidebar, MobileBottomNav, SidebarView } from "@/components/chat/ChatSidebar";
import { ContactList } from "@/components/chat/ContactList";
import { ChatWindow, ChatContact } from "@/components/chat/ChatWindow";
import { StatusView } from "@/components/chat/StatusView";
import { CommunitiesView } from "@/components/chat/CommunitiesView";
import { VanishModeView } from "@/components/chat/VanishModeView";
import { SettingsView } from "@/components/chat/SettingsView";
import { HiddenChatsVault } from "@/components/chat/HiddenChatsVault";
import { BusinessToolsHub } from "@/components/business/BusinessToolsHub";
import { CallsView } from "@/components/chat/CallsView";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUsers } from "@/hooks/useUsers";
import logo from "@/assets/kuikchat-logo.png";

// Re-export for backward compatibility
export type Contact = ChatContact;

const Chat = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [isMobileContactsOpen, setIsMobileContactsOpen] = useState(true);
  const [activeView, setActiveView] = useState<SidebarView>("Chats");
  const [chatWallpaper, setChatWallpaper] = useState<string>("transparent");
  const { users, loading } = useUsers();

  // Convert real users to contacts format
  const contacts: ChatContact[] = users.map((u) => ({
    id: u.id,
    user_id: u.id,
    name: u.display_name || "Unknown User",
    avatar: (u.display_name || "U").slice(0, 2).toUpperCase(),
    avatar_url: u.avatar_url,
    lastMessage: "Tap to start chatting",
    time: "",
    unread: 0,
    online: false,
    about: u.bio || "Hey there! I'm using KuikChat",
  }));

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    setIsMobileContactsOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case "Status":
        return <StatusView />;
      case "Calls":
        return <CallsView onStartCall={() => setActiveView("Chats")} />;
      case "Communities":
        return <CommunitiesView />;
      case "Vanish Mode":
        return <VanishModeView />;
      case "Settings":
        return <SettingsView onViewChange={setActiveView} />;
      case "Hidden":
        return <HiddenChatsVault />;
      case "Business":
        return <BusinessToolsHub />;
      case "Chats":
      default:
        return (
          <>
            {/* Contact List */}
            <div className={`${isMobileContactsOpen ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 flex-col border-r border-border bg-card`}>
              <ContactList
                contacts={contacts}
                selectedContact={selectedContact}
                onSelectContact={handleSelectContact}
                loading={loading}
              />
            </div>

            {/* Chat Window */}
            <div className={`${!isMobileContactsOpen ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
              {selectedContact ? (
                <ChatWindow
                  contact={selectedContact}
                  onBack={() => setIsMobileContactsOpen(true)}
                  wallpaper={chatWallpaper}
                  onWallpaperChange={setChatWallpaper}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-40 h-40 rounded-full brand-gradient mx-auto mb-4 flex items-center justify-center p-6">
                      <img src={logo} alt="KuikChat" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to KuikChat</h2>
                    <p className="text-muted-foreground">Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="business-dark dark flex h-screen w-full bg-background text-foreground overflow-hidden">
        {/* Desktop Sidebar */}
        <ChatSidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row pb-16 md:pb-0">
          {renderContent()}
        </div>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav activeView={activeView} onViewChange={setActiveView} />
      </div>
    </SidebarProvider>
  );
};

export default Chat;
