import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Camera, Copy, Check, X, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  onContactAdded?: (contactId: string) => void;
}

export const QRCodeScanner = ({ open, onClose, onContactAdded }: QRCodeScannerProps) => {
  const [activeTab, setActiveTab] = useState<"scan" | "my-code">("my-code");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  // Generate QR code data URL
  const qrCodeUrl = user 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        JSON.stringify({
          type: "kuikchat-contact",
          userId: user.id,
          name: profile?.display_name || "KuikChat User",
        })
      )}`
    : "";

  const startScanner = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access camera for scanning.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (activeTab === "scan" && open) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [activeTab, open]);

  const handleCopyLink = async () => {
    if (!user) return;
    
    const shareLink = `https://kuikchat.app/add/${user.id}`;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share this link to add you as a contact.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!user) return;
    
    const shareData = {
      title: "Add me on KuikChat",
      text: `Add me as a contact on KuikChat!`,
      url: `https://kuikchat.app/add/${user.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Simulated scan result (in production, use a QR scanning library)
  const simulateScan = () => {
    setScannedData(JSON.stringify({
      type: "kuikchat-contact",
      userId: "demo-alice",
      name: "Alice Johnson",
    }));
    toast({
      title: "Contact Found!",
      description: "Alice Johnson has been added to your contacts.",
    });
    onContactAdded?.("demo-alice");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            QR Code
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "scan" | "my-code")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-code">My Code</TabsTrigger>
            <TabsTrigger value="scan">Scan</TabsTrigger>
          </TabsList>

          <TabsContent value="my-code" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6"
            >
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="Your QR Code"
                  className="w-48 h-48"
                />
              </div>
              
              <p className="mt-4 text-center text-muted-foreground">
                Let others scan this code to add you as a contact
              </p>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-secondary" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copy Link
                </Button>
                <Button className="brand-gradient" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="relative aspect-square bg-black rounded-xl overflow-hidden">
              {isScanning ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 relative">
                      <div className="absolute inset-0 border-2 border-primary/50 rounded-lg" />
                      <motion.div
                        animate={{ y: [0, 180, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-primary shadow-lg shadow-primary"
                      />
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Point your camera at a KuikChat QR code
            </p>

            {/* Demo button for testing */}
            <Button
              variant="outline"
              className="w-full"
              onClick={simulateScan}
            >
              <Camera className="w-4 h-4 mr-2" />
              Simulate Scan (Demo)
            </Button>
          </TabsContent>
        </Tabs>

        <Button variant="ghost" className="w-full" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};
