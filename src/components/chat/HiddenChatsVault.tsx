import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VAULT_PASSWORD = "1234"; // In production, this would be hashed and stored securely

interface HiddenContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
}

const mockHiddenContacts: HiddenContact[] = [
  { id: "h1", name: "Secret Project", avatar: "SP", lastMessage: "Documents received", time: "2h" },
  { id: "h2", name: "Private Notes", avatar: "PN", lastMessage: "Remember to check...", time: "1d" },
];

export const HiddenChatsVault = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const handleUnlock = () => {
    if (password === VAULT_PASSWORD) {
      setIsUnlocked(true);
      setError("");
      setPassword("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
  };

  if (!isUnlocked) {
    return (
      <div className="flex-1 flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Hidden Chats</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm"
          >
            <div className="w-24 h-24 rounded-full bg-muted/50 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-12 h-12 text-muted-foreground" />
            </div>

            <h3 className="text-xl font-bold text-center mb-2">Vault Locked</h3>
            <p className="text-muted-foreground text-center mb-8">
              Enter your password to access hidden conversations
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button onClick={handleUnlock} className="w-full brand-gradient">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Unlock Vault
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Default password: 1234
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Hidden Chats</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLock}>
          <Lock className="w-4 h-4 mr-2" />
          Lock
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {/* Add Hidden Chat */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSetup(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Add Hidden Chat</p>
              <p className="text-sm text-muted-foreground">Move a conversation to vault</p>
            </div>
          </motion.button>

          {/* Hidden Contacts */}
          <AnimatePresence>
            {mockHiddenContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {contact.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{contact.name}</h3>
                    <span className="text-xs text-muted-foreground">{contact.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {mockHiddenContacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hidden chats yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Hidden Chat</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Select a conversation from your chats to move it to the hidden vault.
          </p>
          <Button onClick={() => setShowSetup(false)} className="mt-4">
            Coming Soon
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
