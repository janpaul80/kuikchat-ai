/* KuikChat - shared inline icons (no external icon dependency)
 * Path: src/components/chat/_icons.tsx
 */
import type { CSSProperties } from "react";
export function Ic({ d, style }: { d: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={style}>
      <path d={d} />
    </svg>
  );
}
export const ICONS = {
  quote: "M7 17h3l2-4V7H6v6h3zm8 0h3l2-4V7h-6v6h3z",
  hermes: "M12 2l1.8 4.5L18 8l-3.5 3 1 4.7L12 13.8 8.5 15.7l1-4.7L6 8l4.2-1.5z",
  imported: "M9 2h6a2 2 0 0 1 2 2h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2-2Zm0 2v1h6V4H9Z",
  clock: "M12 8v5l4 2 1-1.7-3.5-2V8zM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  calendar: "M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zm12 7v10H5V9z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 2 4 4h-4z",
  photo: "M21 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-3 6 4-5 3 4 3-2 4 3z",
  link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1 1.5 1.5 1-1a3 3 0 0 1 4 4l-3 3a3 3 0 0 1-4 0zm4-2a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1-1.5-1.5-1 1a3 3 0 0 1-4-4l3-3a3 3 0 0 1 4 0z",
  voice: "M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11z",
  poll: "M4 20h3v-8H4zm6 0h3V4h-3zm6 0h3v-5h-3z",
  group: "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3 0-8 1.5-8 4.5V20h8v-2.5c0-1 .3-1.9.9-2.7A11 11 0 0 0 8 13zm8 0a11 11 0 0 0-1 .05c1 .9 1.5 2 1.5 3.4V20h8v-2.5c0-3-5-4.5-8.5-4.5z",
} as const;
