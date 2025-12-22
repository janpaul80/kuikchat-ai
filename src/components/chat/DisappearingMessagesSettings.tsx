import { useState } from "react";
import { Clock, Timer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type DisappearingDuration = "off" | "5s" | "10s" | "1m" | "5m" | "1h" | "24h";

interface DisappearingMessagesSettingsProps {
  currentDuration: DisappearingDuration;
  onDurationChange: (duration: DisappearingDuration) => void;
  trigger?: React.ReactNode;
}

const durationOptions: { value: DisappearingDuration; label: string; description: string }[] = [
  { value: "off", label: "Off", description: "Messages won't disappear" },
  { value: "5s", label: "5 seconds", description: "For sensitive content" },
  { value: "10s", label: "10 seconds", description: "Quick viewing" },
  { value: "1m", label: "1 minute", description: "Brief conversations" },
  { value: "5m", label: "5 minutes", description: "Short discussions" },
  { value: "1h", label: "1 hour", description: "Extended chats" },
  { value: "24h", label: "24 hours", description: "Day-long retention" },
];

export const DisappearingMessagesSettings = ({
  currentDuration,
  onDurationChange,
  trigger,
}: DisappearingMessagesSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DisappearingDuration>(currentDuration);

  const handleSave = () => {
    onDurationChange(selected);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Timer className="w-4 h-4" />
            Disappearing Messages
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Disappearing Messages
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Set a timer for messages in this chat. Messages will be deleted after the selected time.
          </p>

          <RadioGroup
            value={selected}
            onValueChange={(val) => setSelected(val as DisappearingDuration)}
            className="space-y-2"
          >
            {durationOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  selected === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setSelected(option.value)}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div>
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                {selected === option.value && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
            ))}
          </RadioGroup>

          <Button onClick={handleSave} className="w-full">
            Save Setting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const DisappearingMessageIndicator = ({ duration }: { duration: DisappearingDuration }) => {
  if (duration === "off") return null;
  
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Timer className="w-3 h-3" />
      <span>{duration}</span>
    </div>
  );
};
