import { ChevronLeft, Bell, Volume2, Vibrate, MessageSquare, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface NotificationsSettingsProps {
  onBack: () => void;
}

export const NotificationsSettings = ({ onBack }: NotificationsSettingsProps) => {
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [callNotifications, setCallNotifications] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [volume, setVolume] = useState([70]);
  const [highPriorityNotifications, setHighPriorityNotifications] = useState(false);
  const [reactionNotifications, setReactionNotifications] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-card">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold">Notifications</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Message Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium">Messages</h3>
            </div>

            <div className="pl-13 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message notifications</p>
                  <p className="text-sm text-muted-foreground">Show notifications for new messages</p>
                </div>
                <Switch checked={messageNotifications} onCheckedChange={setMessageNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show preview</p>
                  <p className="text-sm text-muted-foreground">Show message content in notifications</p>
                </div>
                <Switch checked={showPreview} onCheckedChange={setShowPreview} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reaction notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified when someone reacts</p>
                </div>
                <Switch checked={reactionNotifications} onCheckedChange={setReactionNotifications} />
              </div>
            </div>
          </div>

          {/* Group Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-medium">Groups</h3>
            </div>

            <div className="pl-13 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Group notifications</p>
                  <p className="text-sm text-muted-foreground">Show notifications for group messages</p>
                </div>
                <Switch checked={groupNotifications} onCheckedChange={setGroupNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">High priority notifications</p>
                  <p className="text-sm text-muted-foreground">Show alerts for @mentions</p>
                </div>
                <Switch checked={highPriorityNotifications} onCheckedChange={setHighPriorityNotifications} />
              </div>
            </div>
          </div>

          {/* Call Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-medium">Calls</h3>
            </div>

            <div className="pl-13 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Call notifications</p>
                  <p className="text-sm text-muted-foreground">Ring for incoming calls</p>
                </div>
                <Switch checked={callNotifications} onCheckedChange={setCallNotifications} />
              </div>
            </div>
          </div>

          {/* Sound & Vibration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium">Sound & Vibration</h3>
            </div>

            <div className="pl-13 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Vibrate</p>
                  <p className="text-sm text-muted-foreground">Vibrate on notifications</p>
                </div>
                <Switch checked={vibrate} onCheckedChange={setVibrate} />
              </div>

              <div className="space-y-2">
                <p className="font-medium">Notification volume</p>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
