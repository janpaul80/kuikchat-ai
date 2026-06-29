import {
  ShoppingBag,
  Megaphone,
  MessageSquare,
  Clock,
  Zap,
  User,
  Palette,
  Search,
  MoreVertical,
  ListOrdered,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromoCard } from "./tools/PromoCard";
import { ToolGroup, type ToolItem } from "./tools/ToolGroup";
import { useProfile } from "@/hooks/useProfile";

// WhatsApp Business "Grow" section = Catalog + Ads
const growItems: ToolItem[] = [
  {
    icon: ShoppingBag,
    label: "Catalog",
    description: "Show your products and services",
    comingSoon: true,
    iconBgColor: "bg-blue-500/15",
    iconColor: "text-blue-500",
  },
  {
    icon: Megaphone,
    label: "Broadcasts",
    description: "Send a message to multiple contacts",
    comingSoon: true,
    iconBgColor: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
  },
];

// WhatsApp Business "Messaging tools" section
const messagingItems: ToolItem[] = [
  {
    icon: ListOrdered,
    label: "Lists & Labels",
    description: "Sort and find chats more easily",
    comingSoon: true,
    iconBgColor: "bg-violet-500/15",
    iconColor: "text-violet-500",
  },
  {
    icon: MessageSquare,
    label: "Greeting message",
    description: "Send a message when customers contact you",
    comingSoon: true,
    iconBgColor: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    icon: Clock,
    label: "Away message",
    description: "Send a message when you're unavailable",
    comingSoon: true,
    iconBgColor: "bg-amber-500/15",
    iconColor: "text-amber-500",
  },
  {
    icon: Zap,
    label: "Quick replies",
    description: "Save and reuse frequent messages",
    comingSoon: true,
    iconBgColor: "bg-orange-500/15",
    iconColor: "text-orange-500",
  },
];

// WhatsApp Business "General" / Manage section
const manageItems: ToolItem[] = [
  {
    icon: User,
    label: "Business profile",
    description: "Add your address, email, website",
    comingSoon: true,
    iconBgColor: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    icon: Palette,
    label: "Branding",
    description: "Customize your business appearance",
    comingSoon: true,
    iconBgColor: "bg-pink-500/15",
    iconColor: "text-pink-500",
  },
];

export const BusinessToolsHub = () => {
  const { profile } = useProfile();

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header — matches WhatsApp Business "Business" tab header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Business</h1>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1">
        <div className="pb-6">
          {/* Business profile promo card at top */}
          <PromoCard
            businessName={profile?.display_name || "Your Business"}
            category="Business"
          />

          {/* Tool groups — identical structure to WA Business Tools tab */}
          <ToolGroup title="Grow" items={growItems} />
          <ToolGroup title="Messaging tools" items={messagingItems} />
          <ToolGroup title="Manage" items={manageItems} />

          {/* Footer note */}
          <p className="text-xs text-muted-foreground/50 text-center mt-6 px-6 leading-relaxed">
            KuikChat Business features are coming soon.
            {"\n"}All messaging is end-to-end encrypted.
          </p>
        </div>
      </ScrollArea>
    </div>
  );
};
