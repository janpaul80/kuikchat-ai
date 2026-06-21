/**
 * KuikChat - human-friendly time formatting
 * Path: src/lib/formatTime.ts
 *
 * Today      -> "9:30 AM"
 * Yesterday  -> "Yesterday . 8:14 PM"
 * Older      -> "Jun 17, 2026 . 9:30 AM"
 * NOTE: no long dashes anywhere. We use a middot separator.
 */
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export function formatStamp(input: Date | string | number, now: Date = new Date()): string {
  const d = new Date(input);
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return time(d);
  if (sameDay(d, yest)) return `Yesterday \u00B7 ${time(d)}`;
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${date} \u00B7 ${time(d)}`;
}

/** Label for a day divider: "Today" / "Yesterday" / "June 17, 2026". */
export function dayLabel(input: Date | string | number, now: Date = new Date()): string {
  const d = new Date(input);
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

/** Absolute time for tooltips / aria-labels. */
export function absolute(input: Date | string | number): string {
  return new Date(input).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}
