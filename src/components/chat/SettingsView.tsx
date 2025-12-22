import { useState } from "react";
import { Bell, Lock, Palette, HelpCircle, Info, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfile } from "@/hooks/useProfile";
import { ProfileEditDialog } from "./ProfileEditDialog";
import { NotificationsSettings } from "./settings/NotificationsSettings";
import { PrivacySettings } from "./settings/PrivacySettings";
import { AppearanceSettings } from "./settings/AppearanceSettings";
import { HelpSettings } from "./settings/HelpSettings";
import { AboutSettings } from "./settings/AboutSettings";

type SettingsPage = "main" | "notifications" | "privacy" | "appearance" | "help" | "about";

const settingsItems = [
  { icon: Bell, label: "Notifications", description: "Message, group & call tones", page: "notifications" as const },
  { icon: Lock, label: "Privacy", description: "Block contacts, disappearing messages", page: "privacy" as const },
  { icon: Palette, label: "Appearance", description: "Theme, wallpapers, chat settings", page: "appearance" as const },
  { icon: HelpCircle, label: "Help", description: "Help center, contact us, privacy policy", page: "help" as const },
  { icon: Info, label: "About", description: "App info and licenses", page: "about" as const },
];

export const SettingsView = () => {
  const { profile } = useProfile();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState<SettingsPage>("main");

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleBack = () => setCurrentPage("main");

  // Render sub-pages
  if (currentPage === "notifications") {
    return <NotificationsSettings onBack={handleBack} />;
  }
  if (currentPage === "privacy") {
    return <PrivacySettings onBack={handleBack} />;
  }
  if (currentPage === "appearance") {
    return <AppearanceSettings onBack={handleBack} />;
  }
  if (currentPage === "help") {
    return <HelpSettings onBack={handleBack} />;
  }
  if (currentPage === "about") {
    return <AboutSettings onBack={handleBack} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Profile */}
          <div 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
            onClick={() => setShowProfileEdit(true)}
          >
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="brand-gradient text-primary-foreground text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{profile?.display_name || 'Set your name'}</p>
              <p className="text-sm text-muted-foreground">{profile?.about || 'Add your status'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Settings Items */}
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <div 
                key={item.label}
                onClick={() => setCurrentPage(item.page)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <ProfileEditDialog open={showProfileEdit} onOpenChange={setShowProfileEdit} />
    </div>
  );
};
