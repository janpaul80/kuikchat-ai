"use client";
import { dayLabel } from "@/lib/formatTime";
/**
 * KuikChat - DayDivider
 * Path: src/components/chat/DayDivider.tsx
 * Render between messages when the calendar day changes.
 */
export default function DayDivider({ date }: { date: Date | string | number }) {
  return <div className="kc-daydiv">{dayLabel(date)}</div>;
}
