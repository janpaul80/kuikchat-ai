import { useState } from "react";
import { 
  Reply, 
  Forward, 
  Copy, 
  Info, 
  Star, 
  Trash2, 
  MoreHorizontal,
  Pin,
  Languages,
  Plus,
  X
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { SupportedLanguage, languageLabels } from "@/hooks/useTranslation";

interface MessageContextMenuProps {
  children: React.ReactNode;
  messageId: string;
  messageContent: string;
  isOwnMessage: boolean;
  onReply?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onInfo?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onTranslate?: (messageId: string, content: string, language: SupportedLanguage) => void;
  onReaction?: (messageId: string, emoji: string) => void;
}

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉"];
const extendedReactions = ["🔥", "👏", "🤔", "😍", "🥳", "💯", "✨"];
const allEmojis = [
  // Smileys
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊",
  "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋", "😛", "😜",
  "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐",
  "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😌", "😔",
  "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥴", "😵",
  // Gestures
  "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘",
  "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚",
  "🖐️", "🖖", "👋", "🤙", "💪", "🦾", "🙏", "✍️", "🤳", "💅",
  // Hearts & Love
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
  "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️",
  // Objects & Celebrations
  "🎉", "🎊", "🎁", "🎈", "🎂", "🍰", "🥳", "🎄", "🎃", "🎆",
  "🎇", "✨", "💫", "⭐", "🌟", "💥", "🔥", "💯", "🏆", "🥇",
];

const emojiCategories = [
  { name: "Smileys", emojis: allEmojis.slice(0, 50) },
  { name: "Gestures", emojis: allEmojis.slice(50, 78) },
  { name: "Hearts", emojis: allEmojis.slice(78, 98) },
  { name: "Celebration", emojis: allEmojis.slice(98) },
];

export const MessageContextMenu = ({
  children,
  messageId,
  messageContent,
  isOwnMessage,
  onReply,
  onForward,
  onCopy,
  onInfo,
  onStar,
  onDelete,
  onPin,
  onTranslate,
  onReaction,
}: MessageContextMenuProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Smileys");

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
    onCopy?.(messageContent);
  };

  const handleReaction = (emoji: string) => {
    onReaction?.(messageId, emoji);
    toast({
      title: "Reaction added",
      description: `You reacted with ${emoji}`,
    });
  };

  const handleReply = () => {
    onReply?.(messageId);
    toast({
      title: "Reply",
      description: "Replying to message...",
    });
  };

  const handleForward = () => {
    onForward?.(messageId);
    toast({
      title: "Forward",
      description: "Select a chat to forward to",
    });
  };

  const handleInfo = () => {
    onInfo?.(messageId);
    toast({
      title: "Message Info",
      description: "Message details opened",
    });
  };

  const handleStar = () => {
    onStar?.(messageId);
    toast({
      title: "Starred",
      description: "Message added to starred messages",
    });
  };

  const handleDelete = () => {
    onDelete?.(messageId);
    toast({
      title: "Deleted",
      description: "Message deleted",
      variant: "destructive",
    });
  };

  const handlePin = () => {
    onPin?.(messageId);
    toast({
      title: "Pinned",
      description: "Message pinned to chat",
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-72 bg-popover border-border">
        {/* Emoji Reactions Bar */}
        <div className="flex items-center justify-center gap-2 px-5 py-3 border-b border-border bg-muted/30 rounded-t-md">
          {quickReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-xl hover:scale-125 transition-transform rounded hover:bg-muted flex-shrink-0"
            >
              {emoji}
            </button>
          ))}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <button
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors flex-shrink-0 ml-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-popover border-border" align="start" side="bottom">
              {/* Category Tabs */}
              <div className="flex border-b border-border overflow-x-auto">
                {emojiCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                      activeCategory === cat.name 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              {/* Emoji Grid */}
              <div className="p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {emojiCategories
                    .find((c) => c.name === activeCategory)
                    ?.emojis.map((emoji, idx) => (
                      <button
                        key={`${emoji}-${idx}`}
                        onClick={() => {
                          handleReaction(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl p-1.5 rounded hover:bg-muted hover:scale-110 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Primary Actions */}
        <ContextMenuItem onClick={handleReply} className="gap-3 py-3 cursor-pointer">
          <span className="flex-1">Reply</span>
          <Reply className="w-5 h-5 text-muted-foreground" />
        </ContextMenuItem>

        <ContextMenuItem onClick={handleForward} className="gap-3 py-3 cursor-pointer">
          <span className="flex-1">Forward</span>
          <Forward className="w-5 h-5 text-muted-foreground" />
        </ContextMenuItem>

        <ContextMenuItem onClick={handleCopy} className="gap-3 py-3 cursor-pointer">
          <span className="flex-1">Copy</span>
          <Copy className="w-5 h-5 text-muted-foreground" />
        </ContextMenuItem>

        <ContextMenuItem onClick={handleInfo} className="gap-3 py-3 cursor-pointer">
          <span className="flex-1">Info</span>
          <Info className="w-5 h-5 text-muted-foreground" />
        </ContextMenuItem>

        <ContextMenuItem onClick={handleStar} className="gap-3 py-3 cursor-pointer">
          <span className="flex-1">Star</span>
          <Star className="w-5 h-5 text-muted-foreground" />
        </ContextMenuItem>

        <ContextMenuItem 
          onClick={handleDelete} 
          className="gap-3 py-3 cursor-pointer text-destructive focus:text-destructive"
        >
          <span className="flex-1">Delete</span>
          <Trash2 className="w-5 h-5" />
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* More Options Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-3 py-3 cursor-pointer">
            <span className="flex-1">More...</span>
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56 bg-popover border-border">
            {/* Extended Emoji Reactions */}
            <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              {extendedReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-xl hover:scale-125 transition-transform rounded hover:bg-muted flex-shrink-0"
                >
                  {emoji}
                </button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors flex-shrink-0 ml-1">
                    <Plus className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-popover border-border" align="start" side="bottom">
                  {/* Category Tabs */}
                  <div className="flex border-b border-border overflow-x-auto">
                    {emojiCategories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                          activeCategory === cat.name 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  {/* Emoji Grid */}
                  <div className="p-3 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1">
                      {emojiCategories
                        .find((c) => c.name === activeCategory)
                        ?.emojis.map((emoji, idx) => (
                          <button
                            key={`${emoji}-${idx}`}
                            onClick={() => handleReaction(emoji)}
                            className="text-xl p-1.5 rounded hover:bg-muted hover:scale-110 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <ContextMenuItem onClick={handlePin} className="gap-3 py-3 cursor-pointer">
              <span className="flex-1">Pin</span>
              <Pin className="w-5 h-5 text-muted-foreground" />
            </ContextMenuItem>

            {/* Translate Submenu */}
            <ContextMenuSub>
              <ContextMenuSubTrigger className="gap-3 py-3 cursor-pointer">
                <span className="flex-1">Translate</span>
                <Languages className="w-5 h-5 text-muted-foreground" />
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48 bg-popover border-border">
                {(Object.entries(languageLabels) as [SupportedLanguage, string][]).map(([code, name]) => (
                  <ContextMenuItem
                    key={code}
                    onClick={() => onTranslate?.(messageId, messageContent, code)}
                    className="cursor-pointer"
                  >
                    {name}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuItem 
              onClick={handleDelete} 
              className="gap-3 py-3 cursor-pointer text-destructive focus:text-destructive"
            >
              <span className="flex-1">Delete</span>
              <Trash2 className="w-5 h-5" />
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuSub>
              <ContextMenuSubTrigger className="gap-3 py-3 cursor-pointer">
                <span className="flex-1">More...</span>
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48 bg-popover border-border">
                <ContextMenuItem className="cursor-pointer">Report</ContextMenuItem>
                <ContextMenuItem className="cursor-pointer">Block sender</ContextMenuItem>
                <ContextMenuItem className="cursor-pointer">Add to contacts</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
};
