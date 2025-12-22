import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Scan,
  RotateCcw,
  Check,
  X,
  Wand2,
  FileText,
  Sun,
  Contrast,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface DocumentScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (imageData: string) => void;
}

type FilterType = "original" | "grayscale" | "highContrast" | "blackWhite";

interface CornerPoints {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export const DocumentScanner = ({ open, onClose, onScan }: DocumentScannerProps) => {
  const [mode, setMode] = useState<"camera" | "preview" | "edit">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("original");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [corners, setCorners] = useState<CornerPoints>({
    topLeft: { x: 10, y: 10 },
    topRight: { x: 90, y: 10 },
    bottomLeft: { x: 10, y: 90 },
    bottomRight: { x: 90, y: 90 },
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Start camera when dialog opens
  useState(() => {
    if (open && mode === "camera") {
      startCamera();
    }
    return () => stopCamera();
  });

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    
    setCapturedImage(imageData);
    setProcessedImage(imageData);
    setMode("preview");
    stopCamera();
  };

  const applyFilter = (imageData: string, filterType: FilterType): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageData);
          return;
        }

        // Apply brightness and contrast
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.drawImage(img, 0, 0);

        // Apply color filter
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;

        switch (filterType) {
          case "grayscale":
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            break;
          case "highContrast":
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const gray = avg > 128 ? 255 : avg < 64 ? 0 : avg * 2;
              data[i] = gray;
              data[i + 1] = gray;
              data[i + 2] = gray;
            }
            break;
          case "blackWhite":
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const bw = avg > 128 ? 255 : 0;
              data[i] = bw;
              data[i + 1] = bw;
              data[i + 2] = bw;
            }
            break;
        }

        if (filterType !== "original") {
          ctx.putImageData(imageDataObj, 0, 0);
        }

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = imageData;
    });
  };

  const processImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    const processed = await applyFilter(capturedImage, filter);
    setProcessedImage(processed);
    setIsProcessing(false);
  };

  const handleFilterChange = async (newFilter: FilterType) => {
    setFilter(newFilter);
    if (capturedImage) {
      setIsProcessing(true);
      const processed = await applyFilter(capturedImage, newFilter);
      setProcessedImage(processed);
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (processedImage) {
      onScan(processedImage);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    setFilter("original");
    setBrightness(100);
    setContrast(100);
    setMode("camera");
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    handleReset();
    onClose();
  };

  const filters: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: "original", label: "Original", icon: <Camera className="w-4 h-4" /> },
    { type: "grayscale", label: "Grayscale", icon: <FileText className="w-4 h-4" /> },
    { type: "highContrast", label: "High Contrast", icon: <Contrast className="w-4 h-4" /> },
    { type: "blackWhite", label: "B&W", icon: <Wand2 className="w-4 h-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-primary" />
            Document Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* Camera View */}
          {mode === "camera" && (
            <div className="relative aspect-[4/3] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onLoadedMetadata={() => videoRef.current?.play()}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scan overlay */}
              <div className="absolute inset-4 border-2 border-dashed border-primary/50 rounded-lg pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>
              
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                Position document within the frame
              </p>
            </div>
          )}

          {/* Preview/Edit View */}
          {(mode === "preview" || mode === "edit") && processedImage && (
            <div className="relative aspect-[4/3] bg-muted">
              {isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <img
                  src={processedImage}
                  alt="Scanned document"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}
        </div>

        {/* Filter Options (shown in preview mode) */}
        {mode === "preview" && (
          <div className="p-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filters.map((f) => (
                <Button
                  key={f.type}
                  variant={filter === f.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(f.type)}
                  className={filter === f.type ? "brand-gradient" : ""}
                >
                  {f.icon}
                  <span className="ml-2">{f.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm w-20">Brightness</span>
                <Slider
                  value={[brightness]}
                  onValueChange={([v]) => {
                    setBrightness(v);
                    processImage();
                  }}
                  min={50}
                  max={150}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm w-10 text-right">{brightness}%</span>
              </div>

              <div className="flex items-center gap-3">
                <Contrast className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm w-20">Contrast</span>
                <Slider
                  value={[contrast]}
                  onValueChange={([v]) => {
                    setContrast(v);
                    processImage();
                  }}
                  min={50}
                  max={150}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm w-10 text-right">{contrast}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 pt-0 flex gap-2">
          {mode === "camera" ? (
            <>
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button className="flex-1 brand-gradient" onClick={captureImage}>
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button className="flex-1 brand-gradient" onClick={handleConfirm}>
                <Check className="w-4 h-4 mr-2" />
                Use This
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
