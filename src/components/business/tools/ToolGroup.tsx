import type { LucideIcon } from "lucide-react";
import { ToolRow } from "./ToolRow";

export interface ToolItem {
  icon: LucideIcon;
  label: string;
  description?: string;
  comingSoon?: boolean;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
}

interface ToolGroupProps {
  title: string;
  items: ToolItem[];
}

export const ToolGroup = ({ title, items }: ToolGroupProps) => {
  return (
    <div className="flex flex-col">
      {/* WhatsApp-style section header: uppercase label with left padding, subtle divider top */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {title}
        </p>
      </div>

      {/* Card-style container with rounded corners and border */}
      <div className="mx-4 bg-card rounded-xl overflow-hidden border border-border/50">
        {items.map((item, idx) => (
          <ToolRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            description={item.description}
            comingSoon={item.comingSoon}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
            onClick={item.onClick}
            showDivider={idx < items.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
