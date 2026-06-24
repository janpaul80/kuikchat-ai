import type { LucideIcon } from "lucide-react";
import { ToolRow } from "./ToolRow";

export interface ToolItem {
  icon: LucideIcon;
  label: string;
  comingSoon?: boolean;
  onClick?: () => void;
}

interface ToolGroupProps {
  title: string;
  items: ToolItem[];
}

export const ToolGroup = ({ title, items }: ToolGroupProps) => {
  return (
    <div className="flex flex-col gap-1">
      {/* Group title */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
        {title}
      </p>

      {/* Rows */}
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <ToolRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            comingSoon={item.comingSoon}
            onClick={item.onClick}
          />
        ))}
      </div>
    </div>
  );
};
