import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToolRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  comingSoon?: boolean;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
  showDivider?: boolean;
}

export const ToolRow = ({
  icon: Icon,
  label,
  description,
  comingSoon = false,
  iconBgColor = "bg-muted",
  iconColor = "text-muted-foreground",
  onClick,
  showDivider = true,
}: ToolRowProps) => {
  return (
    <div className="flex flex-col">
      <button
        onClick={comingSoon ? undefined : onClick}
        disabled={comingSoon && !onClick}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 active:bg-muted/30 transition-colors text-left disabled:cursor-default"
      >
        {/* Icon container — circular with brand-tinted bg, like WA Business */}
        <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight line-clamp-1">{description}</p>
          )}
        </div>

        {/* Right: coming soon badge or chevron */}
        {comingSoon ? (
          <span className="text-[10px] font-semibold text-muted-foreground/60 bg-muted/60 px-2 py-0.5 rounded-full shrink-0">
            Soon
          </span>
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
        )}
      </button>
      {showDivider && (
        <div className="ml-[68px] h-px bg-border/50" />
      )}
    </div>
  );
};
