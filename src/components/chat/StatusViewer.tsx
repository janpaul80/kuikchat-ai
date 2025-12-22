import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Heart, 
  MessageCircle, 
  Send, 
  Share2, 
  ChevronUp, 
  ChevronDown,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge, VerificationType } from "./VerifiedBadge";
import { toast } from "sonner";

export interface StatusItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userAvatarUrl?: string;
  userVerified?: VerificationType;
  type: "image" | "video";
  content: string;
  caption?: string;
  timestamp: Date;
  likes: number;
  liked: boolean;
  comments: number;
  shares: number;
  saves: number;
  saved?: boolean;
  replies: { id: string; text: string; time: string }[];
}

interface StatusViewerProps {
  open: boolean;
  onClose: () => void;
  statuses: StatusItem[];
  initialIndex?: number;
  onLike: (statusId: string) => void;
  onReply: (statusId: string, text: string) => void;
  onShare?: (statusId: string) => void;
  onSave?: (statusId: string) => void;
  onFollow?: (userId: string) => void;
}

export const StatusViewer = ({
  open,
  onClose,
  statuses: initialStatuses,
  initialIndex = 0,
  onLike,
  onReply,
  onShare,
  onSave,
  onFollow,
}: StatusViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [replyText, setReplyText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [statuses, setStatuses] = useState(initialStatuses);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentStatus = statuses[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  useEffect(() => {
    setStatuses(initialStatuses);
  }, [initialStatuses]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, isMuted]);

  // Handle swipe navigation
  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex < statuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (direction === "up" && currentIndex === statuses.length - 1) {
      onClose();
    }
  };

  const handleReply = () => {
    if (replyText.trim() && currentStatus) {
      onReply(currentStatus.id, replyText);
      toast.success("Comment sent!");
      setReplyText("");
    }
  };

  const handleLikeClick = () => {
    if (currentStatus) {
      onLike(currentStatus.id);
      setStatuses(prev => prev.map(s => 
        s.id === currentStatus.id 
          ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 }
          : s
      ));
      if (!currentStatus.liked) {
        toast.success("❤️ Liked!");
      }
    }
  };

  const handleShareClick = () => {
    if (currentStatus) {
      onShare?.(currentStatus.id);
      toast.success("Share options opened!");
    }
  };

  const handleSaveClick = () => {
    if (currentStatus) {
      onSave?.(currentStatus.id);
      setStatuses(prev => prev.map(s => 
        s.id === currentStatus.id 
          ? { ...s, saved: !s.saved, saves: s.saved ? s.saves - 1 : s.saves + 1 }
          : s
      ));
      toast.success(currentStatus.saved ? "Removed from saved" : "Saved to collection!");
    }
  };

  const handleFollowClick = () => {
    if (currentStatus) {
      const isFollowing = followedUsers.has(currentStatus.userId);
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (isFollowing) {
          newSet.delete(currentStatus.userId);
        } else {
          newSet.add(currentStatus.userId);
        }
        return newSet;
      });
      onFollow?.(currentStatus.userId);
      toast.success(isFollowing ? `Unfollowed ${currentStatus.userName}` : `Following ${currentStatus.userName}! You'll see more reels from them.`);
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
    toast.info("Comments section toggled");
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (!open || !currentStatus) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        ref={containerRef}
      >
        {/* 9:16 Aspect Ratio Container */}
        <div 
          className="relative w-full h-full max-w-[calc(100vh*9/16)] mx-auto overflow-hidden"
          style={{ aspectRatio: "9/16" }}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 w-8 h-8"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <span className="text-white font-bold text-lg">KuikChat Reels</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <MoreHorizontal className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Main Content - Video/Image with dark overlay for testing */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const startY = touch.clientY;
              const handleTouchEnd = (endEvent: TouchEvent) => {
                const endY = endEvent.changedTouches[0].clientY;
                const diff = startY - endY;
                if (Math.abs(diff) > 50) {
                  handleSwipe(diff > 0 ? "up" : "down");
                }
                document.removeEventListener("touchend", handleTouchEnd);
              };
              document.addEventListener("touchend", handleTouchEnd);
            }}
            onWheel={(e) => {
              if (e.deltaY > 30) {
                handleSwipe("up");
              } else if (e.deltaY < -30) {
                handleSwipe("down");
              }
            }}
          >
            {currentStatus.type === "video" ? (
              <video
                ref={videoRef}
                src={currentStatus.content}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover brightness-75"
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                    } else {
                      videoRef.current.pause();
                    }
                  }
                }}
              />
            ) : (
              <img
                src={currentStatus.content}
                alt="Status"
                className="w-full h-full object-cover brightness-75"
              />
            )}
          </div>

          {/* Right Side Actions */}
          <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
            {/* Like */}
            <button
              onClick={handleLikeClick}
              className="flex flex-col items-center active:scale-90 transition-transform"
            >
              <motion.div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                whileTap={{ scale: 1.3 }}
              >
                <Heart
                  className={`w-7 h-7 transition-all ${
                    currentStatus.liked 
                      ? "fill-red-500 text-red-500 scale-110" 
                      : "text-white"
                  }`}
                />
              </motion.div>
              <span className="text-white text-xs font-medium mt-1">
                {formatCount(currentStatus.likes)}
              </span>
            </button>

            {/* Comments */}
            <button
              onClick={handleCommentClick}
              className="flex flex-col items-center active:scale-90 transition-transform"
            >
              <motion.div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                whileTap={{ scale: 1.2 }}
              >
                <MessageCircle className="w-7 h-7 text-white" />
              </motion.div>
              <span className="text-white text-xs font-medium mt-1">
                {formatCount(currentStatus.comments)}
              </span>
            </button>

            {/* Share */}
            <button
              onClick={handleShareClick}
              className="flex flex-col items-center active:scale-90 transition-transform"
            >
              <motion.div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                whileTap={{ scale: 1.2 }}
              >
                <Share2 className="w-7 h-7 text-white" />
              </motion.div>
              <span className="text-white text-xs font-medium mt-1">
                {formatCount(currentStatus.shares)}
              </span>
            </button>

            {/* Save/Bookmark */}
            <button
              onClick={handleSaveClick}
              className="flex flex-col items-center active:scale-90 transition-transform"
            >
              <motion.div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                whileTap={{ scale: 1.2 }}
              >
                <Bookmark 
                  className={`w-7 h-7 transition-all ${
                    currentStatus.saved 
                      ? "fill-white text-white" 
                      : "text-white"
                  }`} 
                />
              </motion.div>
              <span className="text-white text-xs font-medium mt-1">
                {formatCount(currentStatus.saves)}
              </span>
            </button>

            {/* More options */}
            <button 
              className="flex flex-col items-center active:scale-90 transition-transform"
              onClick={() => toast.info("More options coming soon!")}
            >
              <motion.div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                whileTap={{ scale: 1.2 }}
              >
                <MoreHorizontal className="w-7 h-7 text-white" />
              </motion.div>
            </button>

            {/* User Avatar with ring */}
            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white mt-2">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={currentStatus.userAvatarUrl} />
                <AvatarFallback className="rounded-none bg-primary text-primary-foreground text-xs">
                  {currentStatus.userAvatar}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-16 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {/* User info */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-9 h-9 border-2 border-white/30">
                <AvatarImage src={currentStatus.userAvatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {currentStatus.userAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">
                  {currentStatus.userName.toLowerCase().replace(/\s/g, ".")}
                </span>
                {currentStatus.userVerified && (
                  <VerifiedBadge type={currentStatus.userVerified} size="sm" />
                )}
              </div>
              <Button
                variant={followedUsers.has(currentStatus.userId) ? "default" : "outline"}
                size="sm"
                className={`h-7 px-3 text-xs transition-all ${
                  followedUsers.has(currentStatus.userId)
                    ? "bg-white text-black hover:bg-white/90"
                    : "border-white/50 text-white bg-transparent hover:bg-white/20"
                }`}
                onClick={handleFollowClick}
              >
                {followedUsers.has(currentStatus.userId) ? "Following" : "Follow"}
              </Button>
            </div>

            {/* Caption */}
            {currentStatus.caption && (
              <p className="text-white text-sm mb-3 line-clamp-2">
                {currentStatus.caption}
              </p>
            )}

            {/* Sound toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-white hover:bg-white/20 gap-1"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span className="text-xs">Original audio</span>
              </Button>
            </div>
          </div>

          {/* Comment Input */}
          <div className="absolute bottom-0 left-0 right-0 z-30 p-3 bg-card/95 border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add comment..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-muted/50 border-none rounded-full h-10 px-4 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
              />
              {replyText && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-primary"
                  onClick={handleReply}
                >
                  <Send className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* TikTok-style navigation hints */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-24 flex flex-col items-center gap-1 z-10 opacity-60">
            {currentIndex < statuses.length - 1 && (
              <div className="flex flex-col items-center animate-bounce">
                <ChevronUp className="w-5 h-5 text-white" />
                <span className="text-white text-xs">Swipe up for next</span>
              </div>
            )}
          </div>
          
          {/* Side navigation buttons */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/20 w-8 h-8 rounded-full"
                onClick={() => handleSwipe("down")}
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
            )}
            {currentIndex < statuses.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/20 w-8 h-8 rounded-full"
                onClick={() => handleSwipe("up")}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
            )}
          </div>

          {/* Progress dots */}
          <div className="absolute left-1/2 -translate-x-1/2 top-16 flex gap-1 z-20">
            {statuses.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex ? "bg-white w-4" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
