import { useState } from "react";
import { motion } from "framer-motion";
import {
  Smile,
  Search,
  Clock,
  Sparkles,
  ImageIcon,
  Sticker,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onGifSelect?: (gifUrl: string) => void;
  onStickerSelect?: (stickerUrl: string) => void;
  trigger?: React.ReactNode;
}

const emojiCategories = [
  {
    name: "Smileys",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊",
      "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋", "😛", "😜",
      "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐",
      "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪",
      "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥴", "😵", "🤯",
      "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️",
    ],
  },
  {
    name: "Gestures",
    icon: "👋",
    emojis: [
      "👍", "👎", "👊", "✊", "🤛", "🤜", "🤝", "👏", "🙌", "👐",
      "🤲", "🤞", "✌️", "🤟", "🤘", "🤙", "👌", "🤌", "🤏", "✋",
      "🖐️", "🖖", "👋", "🤚", "💪", "🦾", "🙏", "✍️", "🤳", "💅",
      "👈", "👉", "👆", "👇", "☝️", "🫵", "🫱", "🫲", "🫳", "🫴",
    ],
  },
  {
    name: "Hearts",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️",
      "❤️‍🔥", "❤️‍🩹", "💋", "💌", "💑", "💏", "👩‍❤️‍👨", "👩‍❤️‍👩", "👨‍❤️‍👨", "💒",
    ],
  },
  {
    name: "Animals",
    icon: "🐱",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧",
      "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄",
      "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🦂",
    ],
  },
  {
    name: "Food",
    icon: "🍕",
    emojis: [
      "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒",
      "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬",
      "🍕", "🍔", "🍟", "🌭", "🍿", "🧂", "🥓", "🥚", "🍳", "🧇",
      "🥞", "🧈", "🍞", "🥐", "🥖", "🥨", "🧀", "🥗", "🥙", "🌮",
    ],
  },
  {
    name: "Objects",
    icon: "⭐",
    emojis: [
      "⭐", "🌟", "✨", "💫", "🔥", "💥", "⚡", "🌈", "☀️", "🌙",
      "🎉", "🎊", "🎁", "🎈", "🎂", "🍰", "🎄", "🎃", "🎆", "🎇",
      "🏆", "🥇", "🥈", "🥉", "⚽", "🏀", "🏈", "⚾", "🎾", "🏐",
      "💎", "💰", "💵", "💴", "💶", "💷", "💳", "🛒", "🎮", "🎯",
    ],
  },
];

const recentEmojis = ["😂", "❤️", "😍", "🤣", "😊", "🙏", "💕", "😭", "😘", "👍", "😁", "🔥"];

// Sample GIFs (in real app, integrate with GIPHY API)
const sampleGifs = [
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif",
  "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif",
  "https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif",
  "https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif",
];

// Sticker categories
const stickerCategories = [
  {
    name: "Love",
    stickers: ["💘", "💝", "💖", "💗", "💓", "💞", "💕", "❣️"],
  },
  {
    name: "Celebration",
    stickers: ["🎉", "🎊", "🥳", "🎈", "🎁", "🏆", "🥇", "✨"],
  },
  {
    name: "Mood",
    stickers: ["😴", "😌", "🥰", "😎", "🤩", "😇", "🥺", "😈"],
  },
];

export const EmojiPicker = ({ onEmojiSelect, onGifSelect, trigger }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("emoji");
  const [selectedCategory, setSelectedCategory] = useState("Smileys");
  const [isGeneratingSticker, setIsGeneratingSticker] = useState(false);
  const [stickerPrompt, setStickerPrompt] = useState("");
  const { toast } = useToast();

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  const handleGifClick = (gifUrl: string) => {
    if (onGifSelect) {
      onGifSelect(gifUrl);
    } else {
      onEmojiSelect(`[GIF:${gifUrl}]`);
    }
    setOpen(false);
  };


  const handleCreateSticker = async () => {
    if (!stickerPrompt.trim()) return;
    
    setIsGeneratingSticker(true);
    // Simulate AI sticker generation
    setTimeout(() => {
      const randomSticker = stickerCategories[0].stickers[Math.floor(Math.random() * 8)];
      toast({
        title: "Sticker Created!",
        description: "Your custom sticker is ready",
      });
      onEmojiSelect(randomSticker);
      setIsGeneratingSticker(false);
      setStickerPrompt("");
      setOpen(false);
    }, 1500);
  };

  const filteredEmojis = searchQuery
    ? emojiCategories.flatMap(cat => cat.emojis).filter(emoji => 
        emoji.includes(searchQuery)
      )
    : emojiCategories.find(cat => cat.name === selectedCategory)?.emojis || [];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="rounded-full">
              <Smile className="w-5 h-5" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 bg-popover border-border" 
          align="end" 
          side="top"
          sideOffset={10}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-border bg-muted/30">
              <TabsTrigger value="emoji" className="text-xs gap-1">
                <Smile className="w-4 h-4" />
                Emoji
              </TabsTrigger>
              <TabsTrigger value="gif" className="text-xs gap-1">
                <ImageIcon className="w-4 h-4" />
                GIF
              </TabsTrigger>
              <TabsTrigger value="sticker" className="text-xs gap-1">
                <Sticker className="w-4 h-4" />
                Sticker
              </TabsTrigger>
            </TabsList>

            {/* Emoji Tab */}
            <TabsContent value="emoji" className="m-0">
              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search emoji..."
                    className="pl-8 h-8 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Recent */}
              {!searchQuery && (
                <div className="p-2 border-b border-border">
                  <div className="flex items-center gap-1 mb-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Recent</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recentEmojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl p-1 rounded hover:bg-muted transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {!searchQuery && (
                <div className="flex overflow-x-auto border-b border-border p-1 gap-1">
                  {emojiCategories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`p-1.5 rounded text-lg transition-colors shrink-0 ${
                        selectedCategory === cat.name ? "bg-primary/20" : "hover:bg-muted"
                      }`}
                      title={cat.name}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji Grid */}
              <ScrollArea className="h-48">
                <div className="p-2 grid grid-cols-8 gap-1">
                  {filteredEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-xl p-1.5 rounded hover:bg-muted hover:scale-110 transition-all"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* GIF Tab */}
            <TabsContent value="gif" className="m-0">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search GIFs..." className="pl-8 h-8 text-sm" />
                </div>
              </div>
              <ScrollArea className="h-64">
                <div className="p-2 grid grid-cols-2 gap-2">
                  {sampleGifs.map((gif, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGifClick(gif)}
                      className="rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <img src={gif} alt="GIF" className="w-full h-24 object-cover" />
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground py-2">
                  Powered by GIPHY
                </p>
              </ScrollArea>
            </TabsContent>

            {/* Sticker Tab */}
            <TabsContent value="sticker" className="m-0">
              {/* AI Sticker Generator */}
              <div className="p-3 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
                <p className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Sticker Generator
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe your sticker..."
                    className="h-8 text-sm flex-1"
                    value={stickerPrompt}
                    onChange={(e) => setStickerPrompt(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCreateSticker}
                    disabled={isGeneratingSticker || !stickerPrompt.trim()}
                    className="brand-gradient"
                  >
                    {isGeneratingSticker ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </div>

              {/* Sticker Categories */}
              <ScrollArea className="h-52">
                <div className="p-2 space-y-3">
                  {stickerCategories.map((cat) => (
                    <div key={cat.name}>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{cat.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.stickers.map((sticker, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEmojiClick(sticker)}
                            className="text-3xl p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            {sticker}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </>
  );
};
