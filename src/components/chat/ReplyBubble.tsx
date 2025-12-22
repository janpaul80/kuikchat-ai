import { motion } from "framer-motion";
import { X, CornerUpLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReplyBubbleProps {
  replyToContent: string;
  replyToSender: string;
  isOwn?: boolean;
  onClear?: () => void;
  onClick?: () => void;
  compact?: boolean;
}

export const ReplyBubble = ({
  replyToContent,
  replyToSender,
  isOwn = false,
  onClear,
  onClick,
  compact = false,
}: ReplyBubbleProps) => {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mb-1 ${
          isOwn ? "bg-primary-foreground/10" : "bg-muted/30"
        }`}
        onClick={onClick}
      >
        <div className={`w-0.5 h-4 rounded-full ${isOwn ? "bg-primary-foreground/50" : "bg-primary"}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-medium ${isOwn ? "text-primary-foreground/70" : "text-primary"}`}>
            {replyToSender}
          </p>
          <p className={`text-xs truncate ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {replyToContent}
          </p>
        </div>
        <CornerUpLeft className={`w-3 h-3 ${isOwn ? "text-primary-foreground/50" : "text-muted-foreground"}`} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-l-4 border-primary rounded-r-lg"
    >
      <CornerUpLeft className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">{replyToSender}</p>
        <p className="text-sm truncate text-foreground">{replyToContent}</p>
      </div>
      {onClear && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 w-6 h-6"
          onClick={onClear}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
};
