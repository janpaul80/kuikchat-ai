import { ChevronLeft, Lock, Eye, EyeOff, UserX, Timer, Shield, Fingerprint, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrivacySettingsProps {
  onBack: () => void;
}

export const PrivacySettings = ({ onBack }: PrivacySettingsProps) => {
  const [lastSeenVisibility, setLastSeenVisibility] = useState("everyone");
  const [profilePhotoVisibility, setProfilePhotoVisibility] = useState("everyone");
  const [aboutVisibility, setAboutVisibility] = useState("everyone");
  const [statusVisibility, setStatusVisibility] = useState("contacts");
  const [readReceipts, setReadReceipts] = useState(true);
  const [disappearingMessages, setDisappearingMessages] = useState("off");
  const [screenLock, setScreenLock] = useState(false);
  const [twoStepVerification, setTwoStepVerification] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-card">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold">Privacy</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Who can see my personal info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium">Who can see my personal info</h3>
            </div>

            <div className="space-y-4 pl-2">
              <div className="flex items-center justify-between">
                <p className="text-sm">Last seen & online</p>
                <Select value={lastSeenVisibility} onValueChange={setLastSeenVisibility}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="contacts">My contacts</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm">Profile photo</p>
                <Select value={profilePhotoVisibility} onValueChange={setProfilePhotoVisibility}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="contacts">My contacts</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm">About</p>
                <Select value={aboutVisibility} onValueChange={setAboutVisibility}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="contacts">My contacts</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm">Status</p>
                <Select value={statusVisibility} onValueChange={setStatusVisibility}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="contacts">My contacts</SelectItem>
                    <SelectItem value="contacts_except">My contacts except...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Read receipts */}
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Read receipts</p>
                <p className="text-sm text-muted-foreground">Show when you've read messages</p>
              </div>
            </div>
            <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
          </div>

          {/* Disappearing messages */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <Timer className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Default message timer</p>
                <p className="text-sm text-muted-foreground">Start new chats with disappearing messages</p>
              </div>
            </div>
            <Select value={disappearingMessages} onValueChange={setDisappearingMessages}>
              <SelectTrigger className="ml-13">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Blocked contacts */}
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <UserX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium">Blocked contacts</p>
                <p className="text-sm text-muted-foreground">0 contacts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-medium">Security</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Screen lock</p>
                    <p className="text-sm text-muted-foreground">Require fingerprint to open</p>
                  </div>
                </div>
                <Switch checked={screenLock} onCheckedChange={setScreenLock} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Two-step verification</p>
                    <p className="text-sm text-muted-foreground">Add extra security with a PIN</p>
                  </div>
                </div>
                <Switch checked={twoStepVerification} onCheckedChange={setTwoStepVerification} />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
