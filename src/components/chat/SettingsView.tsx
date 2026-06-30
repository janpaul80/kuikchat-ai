import { useEffect, useState } from "react";
import {
  Bell,
  Lock,
  HelpCircle,
  ChevronRight,
  Megaphone,
  Store,
  Star,
  Users,
  Laptop,
  Key,
  MessageSquare,
  ArrowUpDown,
  Link as LinkIcon,
  Heart,
  Search,
  QrCode,
  Smile,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BusinessWizard } from "../business/tools/BusinessWizard";
import { NotificationsSettings } from "./settings/NotificationsSettings";
import { PrivacySettings } from "./settings/PrivacySettings";
import { AppearanceSettings } from "./settings/AppearanceSettings";
import { HelpSettings } from "./settings/HelpSettings";
import { AboutSettings } from "./settings/AboutSettings";
import { SidebarView } from "./ChatSidebar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type SettingsPage = "main" | "notifications" | "privacy" | "appearance" | "help" | "about";

interface SettingsViewProps {
  onViewChange?: (view: SidebarView) => void;
}

export const SettingsView = ({ onViewChange }: SettingsViewProps) => {
  const { user } = useAuth();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState<SettingsPage>("main");
  const [businessProfile, setBusinessProfile] = useState<{
    company_name: string;
    logo_url: string | null;
    description: string | null;
  } | null>(null);
  const displayName =
    businessProfile?.company_name ||
    user?.user_metadata?.full_name ||
    "Your Business";

  useEffect(() => {
    if (!user || showProfileEdit) return;

    let active = true;
    const fetchBusinessProfile = async () => {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("company_name, logo_url, description")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        console.error("Error fetching settings business profile:", error);
        return;
      }

      setBusinessProfile(data);
    };

    fetchBusinessProfile();
    return () => {
      active = false;
    };
  }, [showProfileEdit, user]);

  const getInitials = () => {
    return displayName.slice(0, 2).toUpperCase();
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

  // Settings Items configuration to match the exact grouping from screenshots 8.jpg and 9.jpg
  const groups = [
    {
      id: "group-1",
      items: [
        {
          icon: Megaphone,
          label: "Advertise",
          onClick: () => toast.info("Advertise features coming soon!"),
        },
        {
          icon: Store,
          label: "Business tools",
          onClick: () => {
            if (onViewChange) {
              onViewChange("Business");
            }
          },
        },
      ],
    },
    {
      id: "group-2",
      items: [
        {
          icon: Star,
          label: "Starred",
          onClick: () => toast.info("Starred messages coming soon!"),
        },
        {
          icon: Megaphone,
          label: "Broadcast messages",
          onClick: () => toast.info("Broadcast features coming soon!"),
        },
        {
          icon: Users,
          label: "Communities",
          onClick: () => {
            if (onViewChange) {
              onViewChange("Communities");
            }
          },
        },
        {
          icon: Laptop,
          label: "Linked devices",
          onClick: () => toast.info("Linked devices coming soon!"),
        },
      ],
    },
    {
      id: "group-3",
      items: [
        {
          icon: Key,
          label: "Account",
          onClick: () => toast.info("Account settings coming soon!"),
        },
        {
          icon: Lock,
          label: "Privacy",
          onClick: () => setCurrentPage("privacy"),
        },
        {
          icon: MessageSquare,
          label: "Chats",
          onClick: () => setCurrentPage("appearance"),
        },
        {
          icon: Bell,
          label: "Notifications",
          onClick: () => setCurrentPage("notifications"),
        },
        {
          icon: ArrowUpDown,
          label: "Storage and data",
          onClick: () => toast.info("Storage settings coming soon!"),
        },
        {
          icon: LinkIcon,
          label: "Facebook and Instagram",
          onClick: () => toast.info("Social integration coming soon!"),
        },
      ],
    },
    {
      id: "group-4",
      items: [
        {
          icon: HelpCircle,
          label: "Help and feedback",
          onClick: () => setCurrentPage("help"),
        },
        {
          icon: Heart,
          label: "Invite a contact",
          onClick: () => toast.info("Invite contact link copied to clipboard!"),
        },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header — matches Settings tab header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors">
            <QrCode className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5 pb-8">
          {/* Signed-in business profile card */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/30 cursor-pointer transition-all duration-300"
            onClick={() => setShowProfileEdit(true)}
          >
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={businessProfile?.logo_url || undefined} />
              <AvatarFallback className="brand-gradient text-primary-foreground text-xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">
                {displayName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-emerald-500">
                <Smile className="w-4 h-4 shrink-0" />
                <p className="text-xs font-medium truncate">
                  {businessProfile?.description || "Business account"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/60 shrink-0" />
          </div>

          {/* Grouped Settings Items */}
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-card rounded-xl overflow-hidden border border-border/50"
              >
                {group.items.map((item, idx) => (
                  <div key={item.label}>
                    <button
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-muted/20 active:bg-muted/30 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <item.icon className="w-4.5 h-4.5 text-muted-foreground" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground leading-tight">
                        {item.label}
                      </span>
                      <ChevronRight className="w-4.5 h-4.5 text-muted-foreground/40 shrink-0" />
                    </button>
                    {idx < group.items.length - 1 && (
                      <div className="ml-14 h-px bg-border/50" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <BusinessWizard open={showProfileEdit} onOpenChange={setShowProfileEdit} />
    </div>
  );
};
