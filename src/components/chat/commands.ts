/**
 * KuikChat - command palette command list
 * Path: src/components/chat/commands.ts
 *
 * Each command maps to a filter the client can run against metadata it already
 * has (type, date, sender). No AI needed for these. Hermes natural-language
 * search is handled separately (see CommandPalette: a 2+ word query = Hermes).
 */
import { ICONS } from "./_icons";

export type KCCommand = {
  cmd: string; section: string; desc: string; key: string; icon: string;
};

export const COMMANDS: KCCommand[] = [
  { cmd: "recent",    section: "Jump by time",    desc: "Most recent conversations", key: "/recent",    icon: ICONS.clock },
  { cmd: "today",     section: "Jump by time",    desc: "Everything from today",     key: "/today",     icon: ICONS.calendar },
  { cmd: "yesterday", section: "Jump by time",    desc: "Yesterday's messages",      key: "/yesterday", icon: ICONS.calendar },
  { cmd: "lastweek",  section: "Jump by time",    desc: "Past 7 days",               key: "/lastweek",  icon: ICONS.calendar },
  { cmd: "files",     section: "Jump by content", desc: "Documents and attachments", key: "/files",     icon: ICONS.file },
  { cmd: "photos",    section: "Jump by content", desc: "Images shared here",        key: "/photos",    icon: ICONS.photo },
  { cmd: "links",     section: "Jump by content", desc: "Shared links",              key: "/links",     icon: ICONS.link },
  { cmd: "voice",     section: "Jump by content", desc: "Voice notes",               key: "/voice",     icon: ICONS.voice },
  { cmd: "polls",     section: "Jump by content", desc: "Polls in this chat",        key: "/polls",     icon: ICONS.poll },
  { cmd: "events",    section: "Jump by content", desc: "Scheduled events",          key: "/events",    icon: ICONS.calendar },
  { cmd: "groups",    section: "Jump by content", desc: "Group conversations",       key: "/groups",    icon: ICONS.group },
];
