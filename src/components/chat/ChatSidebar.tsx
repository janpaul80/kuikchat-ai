import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  CircleDot,
  Users,
  Settings,
  Moon,
  Sun,
  EyeOff,
  LogOut,
  Lock,
  Store,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/kuikchat-logo.png";

export type SidebarView = "Chats" | "Status" | "Calls" | "Communities" | "Vanish Mode" | "Settings" | "Hidden" | "Business";

const navItems: { icon: typeof MessageCircle; label: SidebarView }[] = [
  { icon: MessageCircle, label: "Chats" },
  { icon: CircleDot, label: "Status" },
  { icon: Phone, label: "Calls" },
  { icon: Users, label: "Communities" },
  { icon: Store, label: "Business" },
  { icon: EyeOff, label: "Vanish Mode" },
];

interface ChatSidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

// Glowing icon wrapper component
const GlowingIcon = ({
  children,
  isActive,
  onClick
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
        ? "brand-gradient text-primary-foreground"
        : "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
  >
    {/* Glow effect */}
    {isActive && (
      <motion.div
        className="absolute inset-0 rounded-xl brand-gradient opacity-50 blur-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1.2 }}
        transition={{ duration: 0.3 }}
      />
    )}
    <span className="relative z-10">{children}</span>
  </motion.button>
);

// Desktop Sidebar
export const ChatSidebar = ({ activeView, onViewChange }: ChatSidebarProps) => {
  const [isDark, setIsDark] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You've been signed out successfully.",
    });
    navigate("/");
  };

  return (
    <div className="hidden md:flex w-16 lg:w-20 h-full bg-card border-r border-border flex-col items-center py-4">
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="mb-8"
      >
        <img src={logo} alt="KuikChat" className="w-12 h-12 lg:w-14 lg:h-14" />
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-3">
        {navItems.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <div>
                <GlowingIcon
                  isActive={activeView === item.label}
                  onClick={() => onViewChange(item.label)}
                >
                  <item.icon className="w-5 h-5" />
                </GlowingIcon>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label === "Business" ? "Tools" : item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Hidden Chats */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <GlowingIcon
                isActive={activeView === "Hidden"}
                onClick={() => onViewChange("Hidden")}
              >
                <Lock className="w-5 h-5" />
              </GlowingIcon>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Hidden Chats</p>
          </TooltipContent>
        </Tooltip>
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <GlowingIcon isActive={false} onClick={toggleTheme}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </GlowingIcon>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{isDark ? "Light Mode" : "Dark Mode"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <GlowingIcon
                isActive={activeView === "Settings"}
                onClick={() => onViewChange("Settings")}
              >
                <Settings className="w-5 h-5" />
              </GlowingIcon>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

// Mobile Bottom Navigation
export const MobileBottomNav = ({ activeView, onViewChange }: ChatSidebarProps) => {
  const mobileNavItems = [
    { icon: CircleDot, label: "Status" as SidebarView },
    { icon: Phone, label: "Calls" as SidebarView },
    { icon: Store, label: "Business" as SidebarView },
    { icon: MessageCircle, label: "Chats" as SidebarView },
    { icon: Settings, label: "Settings" as SidebarView },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <nav className="flex items-center justify-around py-2 px-4 safe-area-inset-bottom">
        {mobileNavItems.map((item) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.9 }}
            onClick={() => onViewChange(item.label)}
            aria-current={activeView === item.label ? "page" : undefined}
            aria-label={item.label === "Status" ? "Updates" : item.label === "Business" ? "Tools" : item.label}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeView === item.label
                ? "text-white shadow-lg shadow-emerald-500/20"
                : "text-muted-foreground"
              }`}
          >
            {/* Glow effect for active item */}
            {activeView === item.label && (
              <motion.div
                layoutId="mobileNavGlow"
                className="absolute inset-0 rounded-xl brand-gradient opacity-100"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <item.icon className={`w-5 h-5 relative z-10 ${activeView === item.label ? "text-white" : ""
              }`} />
            <span className={`text-xs relative z-10 ${activeView === item.label ? "font-semibold text-white" : ""
              }`}>
              {item.label === "Status" ? "Updates" : item.label === "Business" ? "Tools" : item.label}
            </span>
          </motion.button>
        ))}
      </nav>
    </div>
  );
};
