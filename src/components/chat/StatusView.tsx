import { useState } from "react";
import { Plus, Camera, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusViewer, StatusItem } from "./StatusViewer";
import { VerifiedBadge, VerificationType } from "./VerifiedBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface StatusUser {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  time: string;
  viewed: boolean;
  verified?: VerificationType;
  statuses: StatusItem[];
}

const mockStatusUsers: StatusUser[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "SC",
    time: "10m ago",
    viewed: false,
    verified: "verified",
    statuses: [
      {
        id: "s1",
        userId: "1",
        userName: "Sarah Chen",
        userAvatar: "SC",
        userVerified: "verified",
        type: "video",
        content: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        caption: "Amazing sunset vibes today! 🌅 #travel #sunset",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        likes: 2275,
        liked: false,
        comments: 23,
        shares: 27,
        saves: 221,
        replies: [],
      },
      {
        id: "s2",
        userId: "1",
        userName: "Sarah Chen",
        userAvatar: "SC",
        userVerified: "verified",
        type: "video",
        content: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        caption: "Living my best life ✨",
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        likes: 1845,
        liked: true,
        comments: 45,
        shares: 12,
        saves: 89,
        replies: [],
      },
    ],
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatar: "MJ",
    time: "1h ago",
    viewed: false,
    verified: "team",
    statuses: [
      {
        id: "s3",
        userId: "2",
        userName: "Marcus Johnson",
        userAvatar: "MJ",
        userVerified: "team",
        type: "video",
        content: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        caption: "New project reveal coming soon! 🎬",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        likes: 4523,
        liked: false,
        comments: 156,
        shares: 89,
        saves: 432,
        replies: [],
      },
    ],
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar: "ER",
    time: "3h ago",
    viewed: true,
    statuses: [
      {
        id: "s4",
        userId: "3",
        userName: "Emily Rodriguez",
        userAvatar: "ER",
        type: "video",
        content: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        caption: "Weekend adventures 🏔️",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        likes: 1234,
        liked: false,
        comments: 34,
        shares: 15,
        saves: 67,
        replies: [],
      },
    ],
  },
];

export const StatusView = () => {
  const [statusUsers, setStatusUsers] = useState<StatusUser[]>(mockStatusUsers);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserStatuses, setSelectedUserStatuses] = useState<StatusItem[]>([]);
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const [statusCaption, setStatusCaption] = useState("");

  const handleViewStatus = (user: StatusUser) => {
    setSelectedUserStatuses(user.statuses);
    setViewerOpen(true);
    
    // Mark as viewed
    setStatusUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, viewed: true } : u))
    );
  };

  const handleLike = (statusId: string) => {
    setStatusUsers((prev) =>
      prev.map((user) => ({
        ...user,
        statuses: user.statuses.map((s) =>
          s.id === statusId
            ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 }
            : s
        ),
      }))
    );
    setSelectedUserStatuses((prev) =>
      prev.map((s) =>
        s.id === statusId
          ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 }
          : s
      )
    );
  };

  const handleReply = (statusId: string, text: string) => {
    toast.success("Reply sent!");
  };

  const handleAddStatus = () => {
    toast.success("Status added! Visible for 24 hours.");
    setAddStatusOpen(false);
    setStatusCaption("");
  };

  const recentUpdates = statusUsers.filter((s) => !s.viewed);
  const viewedUpdates = statusUsers.filter((s) => s.viewed);

  return (
    <div className="flex-1 flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Status</h2>
        <p className="text-xs text-muted-foreground">24-hour photos and videos</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* My Status */}
          <Dialog open={addStatusOpen} onOpenChange={setAddStatusOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="brand-gradient text-primary-foreground">
                      ME
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">My Status</p>
                  <p className="text-sm text-muted-foreground">
                    Tap to add status update
                  </p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-24 flex-col gap-2">
                    <Camera className="w-6 h-6" />
                    <span className="text-xs">Camera</span>
                  </Button>
                  <Button variant="outline" className="flex-1 h-24 flex-col gap-2">
                    <Image className="w-6 h-6" />
                    <span className="text-xs">Gallery</span>
                  </Button>
                </div>
                <Input
                  placeholder="Add a caption..."
                  value={statusCaption}
                  onChange={(e) => setStatusCaption(e.target.value)}
                />
                <Button onClick={handleAddStatus} className="w-full brand-gradient">
                  Post Status
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Recent Updates */}
          {recentUpdates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Recent updates
              </h3>
              <div className="space-y-2">
                {recentUpdates.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleViewStatus(user)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-primary to-accent">
                        <Avatar className="w-full h-full border-2 border-background">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.avatar}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium">{user.name}</p>
                        {user.verified && <VerifiedBadge type={user.verified} size="sm" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.time}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.statuses.length} {user.statuses.length === 1 ? "story" : "stories"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Viewed Updates */}
          {viewedUpdates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Viewed updates
              </h3>
              <div className="space-y-2">
                {viewedUpdates.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleViewStatus(user)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full p-0.5 bg-muted">
                        <Avatar className="w-full h-full border-2 border-background">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.avatar}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium">{user.name}</p>
                        {user.verified && <VerifiedBadge type={user.verified} size="sm" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Status Button */}
      <div className="p-4 border-t border-border">
        <Button
          className="w-full brand-gradient"
          onClick={() => setAddStatusOpen(true)}
        >
          <Camera className="w-4 h-4 mr-2" />
          Add Status
        </Button>
      </div>

      {/* Status Viewer */}
      <StatusViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        statuses={selectedUserStatuses}
        onLike={handleLike}
        onReply={handleReply}
      />
    </div>
  );
};
