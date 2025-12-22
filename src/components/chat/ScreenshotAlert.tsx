import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ScreenshotAlertProps {
  chatId: string;
  contactName: string;
  onScreenshotDetected?: () => void;
}

// Simulated screenshot detection (in real app, would use native APIs)
export const useScreenshotDetection = (onDetected: () => void) => {
  useEffect(() => {
    // Keyboard shortcut detection for common screenshot combos
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect PrintScreen, Cmd+Shift+3/4 (Mac), Win+Shift+S
      if (
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) ||
        (e.ctrlKey && e.key === "PrintScreen")
      ) {
        onDetected();
      }
    };

    // Visibility change detection (some screenshot tools cause this)
    const handleVisibilityChange = () => {
      // This is a heuristic - not foolproof
      if (document.hidden) {
        // Could potentially be a screenshot
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onDetected]);
};

export const ScreenshotAlert = ({
  chatId,
  contactName,
  onScreenshotDetected,
}: ScreenshotAlertProps) => {
  const [alerts, setAlerts] = useState<{ id: string; time: Date; isOwn: boolean }[]>([]);

  // Demo: Add a simulated alert after component mounts
  useEffect(() => {
    const demoTimeout = setTimeout(() => {
      // Simulate receiving a screenshot notification
      const shouldShowDemo = Math.random() > 0.7;
      if (shouldShowDemo) {
        addAlert(false);
      }
    }, 10000);

    return () => clearTimeout(demoTimeout);
  }, [chatId]);

  const addAlert = (isOwn: boolean) => {
    const newAlert = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date(),
      isOwn,
    };
    setAlerts((prev) => [...prev, newAlert]);

    if (!isOwn) {
      toast.warning(`${contactName} took a screenshot`, {
        icon: <Camera className="w-4 h-4" />,
        duration: 5000,
      });
    }

    // Remove alert after 30 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
    }, 30000);
  };

  // Use screenshot detection hook
  useScreenshotDetection(() => {
    addAlert(true);
    onScreenshotDetected?.();
  });

  return (
    <AnimatePresence>
      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="mx-4 mb-2"
        >
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Camera className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-500">
              {alert.isOwn
                ? "You took a screenshot"
                : `${contactName} took a screenshot`}
            </span>
            <span className="text-xs text-amber-500/70">
              {alert.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

// In-message screenshot notification
export const ScreenshotMessage = ({ 
  userName, 
  time 
}: { 
  userName: string; 
  time: string 
}) => (
  <div className="flex justify-center my-2">
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-muted/50 text-xs text-muted-foreground">
      <Camera className="w-3.5 h-3.5" />
      <span>{userName} took a screenshot</span>
      <span className="opacity-70">{time}</span>
    </div>
  </div>
);
