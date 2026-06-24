import {
  ShoppingBag,
  Megaphone,
  Tag,
  MessageSquare,
  Clock,
  Zap,
  User,
  Palette,
} from "lucide-react";
import { PromoCard } from "./tools/PromoCard";
import { ToolGroup, type ToolItem } from "./tools/ToolGroup";

const growItems: ToolItem[] = [
  { icon: ShoppingBag, label: "Catalog", comingSoon: true },
  { icon: Megaphone, label: "Broadcasts", comingSoon: true },
];

const organizeItems: ToolItem[] = [
  { icon: Tag, label: "Lists & Labels", comingSoon: true },
  { icon: MessageSquare, label: "Greeting message", comingSoon: true },
  { icon: Clock, label: "Away message", comingSoon: true },
  { icon: Zap, label: "Quick replies", comingSoon: true },
];

const manageItems: ToolItem[] = [
  { icon: User, label: "Profile", comingSoon: true },
  { icon: Palette, label: "Branding", comingSoon: true },
];

export const BusinessToolsHub = () => {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto p-4 gap-4">
      {/* Promo card pinned at top */}
      <PromoCard />

      {/* Tool groups */}
      <ToolGroup title="Grow" items={growItems} />
      <ToolGroup title="Organize" items={organizeItems} />
      <ToolGroup title="Manage" items={manageItems} />
    </div>
  );
};
