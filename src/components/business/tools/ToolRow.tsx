import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToolRowProps {
  icon: LucideIcon;
  label: string;
  comingSoon?: boolean;
  onClick?: () => void;
}

export const ToolRow = ({ icon: Icon, label, comingSoon = false, onClick }: ToolRowProps) => {
  return (
    <button
      onClick={comingSoon ? undefined : onClick}
      disabled={comingSoon}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 hover:bg-muted/60 disabled:cursor-default transition-colors group"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>

      {/* Label */}
      <span className="flex-1 text-left text-sm font-medium text-foreground">
        {label}
      </span>

      {/* Coming soon badge or chevron */}
      {comingSoon ? (
        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Soon
        </span>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
};
