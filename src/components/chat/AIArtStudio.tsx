import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Wand2, Send, Loader2, Download, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AIArtStudioProps {
  open: boolean;
  onClose: () => void;
  onSendImage?: (imageUrl: string, prompt: string) => void;
}

const stylePresets = [
  { label: "Photorealistic", value: "photorealistic, ultra detailed, 8k" },
  { label: "Digital Art", value: "digital art, vibrant colors, detailed" },
  { label: "Anime", value: "anime style, manga, Japanese animation" },
  { label: "Oil Painting", value: "oil painting, classical art style, textured" },
  { label: "Watercolor", value: "watercolor painting, soft, artistic" },
  { label: "3D Render", value: "3d render, CGI, octane render" },
];

export const AIArtStudio = ({ open, onClose, onSendImage }: AIArtStudioProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const fullPrompt = selectedStyle ? `${prompt}, ${selectedStyle}` : prompt;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt: fullPrompt }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error("No image returned");
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    if (generatedImage && onSendImage) {
      onSendImage(generatedImage, prompt);
      handleClose();
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `ai-art-${Date.now()}.png`;
    link.click();
  };

  const handleClose = () => {
    setPrompt("");
    setSelectedStyle("");
    setGeneratedImage(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary-foreground" />
            </div>
            AI Art Studio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Style Presets */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Style (optional)</p>
            <div className="flex flex-wrap gap-2">
              {stylePresets.map((style) => (
                <Button
                  key={style.label}
                  variant={selectedStyle === style.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStyle(
                    selectedStyle === style.value ? "" : style.value
                  )}
                  className={selectedStyle === style.value ? "brand-gradient" : ""}
                >
                  {style.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full brand-gradient"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          {/* Generated Image */}
          <AnimatePresence>
            {generatedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-3"
              >
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={generatedImage}
                    alt="AI Generated"
                    className="w-full h-auto"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {onSendImage && (
                    <Button
                      className="flex-1 brand-gradient"
                      onClick={handleSend}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send in Chat
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full brand-gradient animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary animate-bounce" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Creating your masterpiece...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
