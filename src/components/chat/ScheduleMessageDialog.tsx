import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Repeat, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RepeatType = "once" | "daily" | "weekly" | "monthly";

interface ScheduleMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: Date, repeatType: RepeatType) => void;
  messagePreview: string;
}

export const ScheduleMessageDialog = ({
  open,
  onClose,
  onSchedule,
  messagePreview,
}: ScheduleMessageDialogProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeatType, setRepeatType] = useState<RepeatType>("once");

  const handleSchedule = () => {
    if (!date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt <= new Date()) return;
    onSchedule(scheduledAt, repeatType);
    onClose();
    setDate("");
    setTime("");
    setRepeatType("once");
  };

  const minDate = new Date().toISOString().split("T")[0];
  const minTime = date === minDate 
    ? new Date().toTimeString().slice(0, 5) 
    : "00:00";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Schedule Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Message Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Message:</p>
            <p className="text-sm truncate">{messagePreview || "Your message here..."}</p>
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="schedule-date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              className="w-full"
            />
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <Label htmlFor="schedule-time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time
            </Label>
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              min={date === minDate ? minTime : undefined}
              className="w-full"
            />
          </div>

          {/* Repeat Option */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Repeat
            </Label>
            <Select value={repeatType} onValueChange={(v) => setRepeatType(v as RepeatType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select repeat frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">
                  <span className="flex items-center gap-2">Once (No repeat)</span>
                </SelectItem>
                <SelectItem value="daily">
                  <span className="flex items-center gap-2">Daily</span>
                </SelectItem>
                <SelectItem value="weekly">
                  <span className="flex items-center gap-2">Weekly</span>
                </SelectItem>
                <SelectItem value="monthly">
                  <span className="flex items-center gap-2">Monthly</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Summary */}
          {date && time && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-primary/10 rounded-lg border border-primary/20"
            >
              <p className="text-sm text-primary">
                {repeatType === "once"
                  ? `Will be sent on ${new Date(`${date}T${time}`).toLocaleString()}`
                  : `Starting ${new Date(`${date}T${time}`).toLocaleString()}, repeating ${repeatType}`}
              </p>
            </motion.div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule} 
            disabled={!date || !time}
            className="brand-gradient"
          >
            <Send className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
