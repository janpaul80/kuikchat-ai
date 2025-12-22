import { useState } from "react";
import { Lock, Shield, ShieldCheck, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EncryptionBannerProps {
  contactName: string;
}

export const EncryptionBanner = ({ contactName }: EncryptionBannerProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2 mx-4 mb-2 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>Messages are end-to-end encrypted. Tap to learn more.</span>
        </div>
        <Info className="w-3.5 h-3.5 text-muted-foreground" />
      </motion.div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              End-to-End Encryption
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-12 h-12 text-primary" />
              </div>
            </div>

            <p className="text-center text-muted-foreground">
              Messages and calls with <span className="font-semibold text-foreground">{contactName}</span> are secured with end-to-end encryption.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Only you and {contactName} can read</p>
                  <p className="text-xs text-muted-foreground">
                    Not even KuikChat can access your messages
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Verified encryption</p>
                  <p className="text-xs text-muted-foreground">
                    Your security code: 78291-45628-12093
                  </p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full"
              variant="outline"
              onClick={() => setShowDetails(false)}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const EncryptionIndicator = () => (
  <div className="flex items-center gap-1 text-xs text-muted-foreground">
    <Lock className="w-3 h-3" />
    <span>Encrypted</span>
  </div>
);
