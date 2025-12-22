import { ChevronLeft, Palette, Sun, Moon, Monitor, Type, Image, MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AppearanceSettingsProps {
  onBack: () => void;
}

const themes = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

const accentColors = [
  { color: "hsl(142, 76%, 36%)", name: "Green" },
  { color: "hsl(221, 83%, 53%)", name: "Blue" },
  { color: "hsl(262, 83%, 58%)", name: "Purple" },
  { color: "hsl(346, 77%, 50%)", name: "Pink" },
  { color: "hsl(25, 95%, 53%)", name: "Orange" },
  { color: "hsl(47, 95%, 53%)", name: "Yellow" },
];

const fontSizes = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

export const AppearanceSettings = ({ onBack }: AppearanceSettingsProps) => {
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [selectedAccent, setSelectedAccent] = useState(accentColors[0].color);
  const [fontSize, setFontSize] = useState("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [enterToSend, setEnterToSend] = useState(true);
  const [mediaAutoDownload, setMediaAutoDownload] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-card">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold">Appearance</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Theme */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium">Theme</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    selectedTheme === theme.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-border/80"
                  )}
                >
                  <theme.icon className="w-6 h-6" />
                  <span className="text-sm">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-4">
            <h3 className="font-medium">Accent color</h3>
            <div className="flex gap-3 flex-wrap">
              {accentColors.map((accent) => (
                <button
                  key={accent.name}
                  onClick={() => setSelectedAccent(accent.color)}
                  className={cn(
                    "w-12 h-12 rounded-full transition-all",
                    selectedAccent === accent.color 
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" 
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: accent.color }}
                  title={accent.name}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Type className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium">Font size</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {fontSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setFontSize(size.id)}
                  className={cn(
                    "py-3 px-4 rounded-xl border-2 transition-all",
                    fontSize === size.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-border/80"
                  )}
                >
                  <span className={cn(
                    "text-sm",
                    size.id === "small" && "text-xs",
                    size.id === "large" && "text-base"
                  )}>{size.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wallpaper */}
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium">Chat wallpaper</p>
                <p className="text-sm text-muted-foreground">Change background image</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Chat Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-medium">Chat settings</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div>
                  <p className="font-medium">Enter is send</p>
                  <p className="text-sm text-muted-foreground">Press Enter to send messages</p>
                </div>
                <Switch checked={enterToSend} onCheckedChange={setEnterToSend} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div>
                  <p className="font-medium">Media auto-download</p>
                  <p className="text-sm text-muted-foreground">Automatically download photos & videos</p>
                </div>
                <Switch checked={mediaAutoDownload} onCheckedChange={setMediaAutoDownload} />
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-4">
            <h3 className="font-medium">Accessibility</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div>
                  <p className="font-medium">Reduce motion</p>
                  <p className="text-sm text-muted-foreground">Minimize animations</p>
                </div>
                <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div>
                  <p className="font-medium">High contrast</p>
                  <p className="text-sm text-muted-foreground">Increase text and UI contrast</p>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
