import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EventCreatorProps {
  open: boolean;
  onClose: () => void;
  onSendEvent: (event: CalendarEvent) => void;
}

export interface CalendarEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
}

export const EventCreator = ({ open, onClose, onSendEvent }: EventCreatorProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title || !date) return;

    const event: CalendarEvent = {
      title,
      date,
      time,
      location,
      description,
    };

    onSendEvent(event);
    
    // Reset form
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setDescription("");
    onClose();
  };

  const isValid = title.trim() && date;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Create Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Team Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-10"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  className="pl-10"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Conference Room A"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="flex-1 brand-gradient"
              disabled={!isValid}
              onClick={handleSubmit}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Event message card component to display in chat
export const EventCard = ({ event }: { event: CalendarEvent }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleAddToCalendar = () => {
    // Create ICS file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.date.replace(/-/g, "")}${event.time ? "T" + event.time.replace(":", "") + "00" : ""}
SUMMARY:${event.title}
LOCATION:${event.location}
DESCRIPTION:${event.description || ""}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-4 max-w-xs"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg brand-gradient flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{event.title}</h4>
          <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
          {event.time && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.time}
            </p>
          )}
          {event.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.location}
            </p>
          )}
        </div>
      </div>
      
      <Button
        size="sm"
        variant="outline"
        className="w-full mt-3"
        onClick={handleAddToCalendar}
      >
        Add to Calendar
      </Button>
    </motion.div>
  );
};
