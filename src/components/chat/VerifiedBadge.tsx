import { BadgeCheck, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type VerificationType = "verified" | "team" | "official";

interface VerifiedBadgeProps {
  type: VerificationType;
  size?: "sm" | "md" | "lg";
}

const badgeConfig: Record<VerificationType, { icon: typeof BadgeCheck; color: string; label: string }> = {
  verified: {
    icon: BadgeCheck,
    color: "text-blue-500",
    label: "Verified User",
  },
  team: {
    icon: Shield,
    color: "text-purple-500",
    label: "Team Member",
  },
  official: {
    icon: BadgeCheck,
    color: "text-green-500",
    label: "Official Account",
  },
};

const sizeConfig = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export const VerifiedBadge = ({ type, size = "md" }: VerifiedBadgeProps) => {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className={`${sizeConfig[size]} ${config.color} inline-block ml-1`} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
