import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Upload, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Solid color options
const solidColors = [
  { id: "default", name: "Default", value: "transparent" },
  { id: "beige", name: "Beige", value: "#F5F5DC" },
  { id: "slate", name: "Slate", value: "#1e293b" },
  { id: "forest", name: "Forest", value: "#064e3b" },
  { id: "ocean", name: "Ocean", value: "#0c4a6e" },
  { id: "wine", name: "Wine", value: "#4c0519" },
  { id: "midnight", name: "Midnight", value: "#0f172a" },
  { id: "cream", name: "Cream", value: "#fffbeb" },
  { id: "lavender", name: "Lavender", value: "#ddd6fe" },
];

// Sample HD wallpapers (in production, these would be actual image URLs)
const hdWallpapers = [
  { id: "nature1", name: "Mountain Sunset", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
  { id: "nature2", name: "Ocean Waves", url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800" },
  { id: "nature3", name: "Forest Path", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800" },
  { id: "abstract1", name: "Gradient", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800" },
  { id: "city1", name: "City Lights", url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800" },
  { id: "space1", name: "Galaxy", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800" },
];

interface WallpaperPickerProps {
  currentWallpaper: string;
  onWallpaperChange: (wallpaper: string) => void;
  trigger?: React.ReactNode;
}

export const WallpaperPicker = ({ 
  currentWallpaper, 
  onWallpaperChange,
  trigger 
}: WallpaperPickerProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "images">("colors");

  const handleSelect = (value: string) => {
    onWallpaperChange(value);
    setOpen(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onWallpaperChange(result);
        setOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <ImageIcon className="w-4 h-4 mr-2" />
            Wallpaper
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Wallpaper</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "colors" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("colors")}
            className="flex-1"
          >
            Solid Colors
          </Button>
          <Button
            variant={activeTab === "images" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("images")}
            className="flex-1"
          >
            HD Images
          </Button>
        </div>

        <ScrollArea className="h-[300px]">
          {activeTab === "colors" ? (
            <div className="grid grid-cols-3 gap-3 p-1">
              {solidColors.map((color) => (
                <motion.button
                  key={color.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(color.value)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                    currentWallpaper === color.value 
                      ? "border-primary" 
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                  style={{ backgroundColor: color.value === "transparent" ? undefined : color.value }}
                >
                  {color.value === "transparent" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-background" />
                  )}
                  {currentWallpaper === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 right-1 text-xs text-center truncate px-1 py-0.5 rounded bg-black/50 text-white">
                    {color.name}
                  </span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 p-1">
              {/* Upload custom */}
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Upload Custom Image</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>

              {/* HD Wallpapers grid */}
              <div className="grid grid-cols-2 gap-3">
                {hdWallpapers.map((wallpaper) => (
                  <motion.button
                    key={wallpaper.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(wallpaper.url)}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-colors ${
                      currentWallpaper === wallpaper.url 
                        ? "border-primary" 
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img 
                      src={wallpaper.url} 
                      alt={wallpaper.name}
                      className="w-full h-full object-cover"
                    />
                    {currentWallpaper === wallpaper.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 text-xs text-center truncate px-1 py-0.5 rounded bg-black/50 text-white">
                      {wallpaper.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
