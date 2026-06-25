import { Share2, ChevronRight, Building2, BadgeCheck } from "lucide-react";
import logo from "@/assets/kuikchat-logo.png";

interface PromoCardProps {
  businessName?: string;
  category?: string;
  onEditProfile?: () => void;
  onShare?: () => void;
}

export const PromoCard = ({
  businessName = "Your Business",
  category = "Business",
  onEditProfile,
  onShare,
}: PromoCardProps) => {
  return (
    <div className="flex flex-col">
      {/* Business profile card — mirrors WhatsApp Business profile banner area */}
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden border border-border/50 bg-card">
        {/* Brand gradient banner */}
        <div className="h-24 brand-gradient relative">
          {/* Subtle pattern overlay for depth */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Avatar overlapping banner */}
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-background border-4 border-background flex items-center justify-center overflow-hidden shadow-md">
                <img
                  src={logo}
                  alt="Business logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              {/* Verified badge */}
              <div className="absolute -bottom-0.5 -right-0.5">
                <BadgeCheck className="w-5 h-5 text-primary fill-primary" />
              </div>
            </div>

            {/* Edit profile button */}
            <button
              onClick={onEditProfile}
              className="text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Edit profile
            </button>
          </div>

          {/* Business name + category */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-foreground leading-tight">
                {businessName}
              </h3>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{category}</p>
            </div>
          </div>

          {/* Share CTA */}
          <button
            onClick={onShare}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary/8 hover:bg-primary/12 border border-primary/20 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Share2 className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  Share your business
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  Let customers find and message you
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
