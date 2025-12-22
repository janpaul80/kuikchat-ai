import { useState } from "react";
import { Plus, Users, ArrowLeft, Send, Image, Settings, Bell, UserPlus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  members: number;
  avatar: string;
  description: string;
  thumbnail: string;
  posts: CommunityPost[];
}

interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  time: string;
  likes: number;
}

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Tech Enthusiasts",
    members: 1234,
    avatar: "TE",
    description: "Discussing the latest in tech",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop",
    posts: [
      { id: "p1", author: "Alex Chen", authorAvatar: "AC", content: "Just got the new M3 MacBook! Anyone else upgrading?", time: "2h ago", likes: 24 },
      { id: "p2", author: "Sarah Kim", authorAvatar: "SK", content: "What do you all think about the latest AI developments?", time: "4h ago", likes: 56 },
    ],
  },
  {
    id: "2",
    name: "Design Hub",
    members: 856,
    avatar: "DH",
    description: "UI/UX designers community",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
    posts: [
      { id: "p3", author: "Mike Johnson", authorAvatar: "MJ", content: "Check out my latest Figma plugin! Link in bio.", time: "1h ago", likes: 42 },
    ],
  },
  {
    id: "3",
    name: "Startup Founders",
    members: 432,
    avatar: "SF",
    description: "Connect with fellow entrepreneurs",
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
    posts: [
      { id: "p4", author: "Emma Wilson", authorAvatar: "EW", content: "We just closed our seed round! 🎉", time: "30m ago", likes: 128 },
    ],
  },
  {
    id: "4",
    name: "Photography",
    members: 2156,
    avatar: "PH",
    description: "Share your best shots",
    thumbnail: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=200&fit=crop",
    posts: [],
  },
  {
    id: "5",
    name: "Gaming",
    members: 3421,
    avatar: "GM",
    description: "Gamers unite!",
    thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=200&fit=crop",
    posts: [],
  },
];

export const CommunitiesView = () => {
  const [communities, setCommunities] = useState<Community[]>(mockCommunities);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDesc, setNewCommunityDesc] = useState("");
  const [newPostText, setNewPostText] = useState("");

  const handleCreateCommunity = () => {
    if (!newCommunityName.trim()) {
      toast.error("Please enter a community name");
      return;
    }

    const newCommunity: Community = {
      id: `new-${Date.now()}`,
      name: newCommunityName,
      members: 1,
      avatar: newCommunityName.slice(0, 2).toUpperCase(),
      description: newCommunityDesc || "A new community",
      thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=200&fit=crop",
      posts: [],
    };

    setCommunities((prev) => [newCommunity, ...prev]);
    setCreateDialogOpen(false);
    setNewCommunityName("");
    setNewCommunityDesc("");
    toast.success("Community created!");
  };

  const handleSendPost = () => {
    if (!newPostText.trim() || !selectedCommunity) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: "You",
      authorAvatar: "YO",
      content: newPostText,
      time: "Just now",
      likes: 0,
    };

    setCommunities((prev) =>
      prev.map((c) =>
        c.id === selectedCommunity.id
          ? { ...c, posts: [newPost, ...c.posts] }
          : c
      )
    );
    setSelectedCommunity((prev) =>
      prev ? { ...prev, posts: [newPost, ...prev.posts] } : null
    );
    setNewPostText("");
    toast.success("Post shared!");
  };

  // Community Detail View
  if (selectedCommunity) {
    return (
      <div className="flex-1 flex flex-col bg-card">
        {/* Header with thumbnail */}
        <div className="relative">
          <img
            src={selectedCommunity.thumbnail}
            alt={selectedCommunity.name}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 left-3 bg-background/50 backdrop-blur-sm hover:bg-background/70"
            onClick={() => setSelectedCommunity(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-background/50 backdrop-blur-sm hover:bg-background/70"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Community Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/20 text-primary">
                {selectedCommunity.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{selectedCommunity.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedCommunity.description}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Users className="w-3 h-3" />
                <span>{selectedCommunity.members.toLocaleString()} members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {selectedCommunity.posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No posts yet</p>
                <p className="text-sm">Be the first to share something!</p>
              </div>
            ) : (
              selectedCommunity.posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {post.authorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.time}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="hover:text-primary transition-colors">
                      ❤️ {post.likes}
                    </button>
                    <button className="hover:text-primary transition-colors">
                      💬 Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Post Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Image className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Share something with the community..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendPost()}
              className="flex-1"
            />
            <Button
              size="icon"
              className="shrink-0 brand-gradient"
              onClick={handleSendPost}
              disabled={!newPostText.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Communities List View
  return (
    <div className="flex-1 flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Communities</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Create Community */}
          <div
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">New Community</p>
              <p className="text-sm text-muted-foreground">Create a new community</p>
            </div>
          </div>

          {/* Your Communities */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Your communities</h3>
            <div className="space-y-3">
              {communities.map((community) => (
                <div
                  key={community.id}
                  onClick={() => setSelectedCommunity(community)}
                  className="rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 cursor-pointer transition-all hover:shadow-lg group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-24 overflow-hidden">
                    <img
                      src={community.thumbnail}
                      alt={community.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      <span>{community.members.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-3 flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-lg shrink-0">
                      <AvatarFallback className="rounded-lg bg-primary/20 text-primary text-sm">
                        {community.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{community.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{community.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Create Community Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Community
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Community Name</label>
              <Input
                placeholder="e.g., Photography Club"
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="What's this community about?"
                value={newCommunityDesc}
                onChange={(e) => setNewCommunityDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload cover image</p>
              </div>
            </div>
            <Button onClick={handleCreateCommunity} className="w-full brand-gradient">
              Create Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
