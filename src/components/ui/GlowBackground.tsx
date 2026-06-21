"use client";
import { motion } from "framer-motion";

/**
 * KuikChat brand background - auto-looping spark/glow in brand blue->green.
 * No external install. Pure framer-motion + Tailwind. Drop behind any hero.
 * Usage: <div className="relative"><GlowBackground /> ...content... </div>
 */
export default function GlowBackground({ className = "" }: { className?: string }) {
  const blobs = [
    { c1: "hsl(217 91% 60%)", x: ["-10%", "20%", "-10%"], y: ["-10%", "15%", "-10%"], size: 520, delay: 0 },
    { c1: "hsl(142 71% 45%)", x: ["60%", "40%", "60%"], y: ["10%", "40%", "10%"], size: 460, delay: 2 },
    { c1: "hsl(190 90% 55%)", x: ["30%", "55%", "30%"], y: ["50%", "20%", "50%"], size: 400, delay: 4 },
  ];
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden bg-black ${className}`} aria-hidden="true">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[90px]"
          style={{ width: b.size, height: b.size, background: `radial-gradient(circle at center, ${b.c1} 0%, transparent 70%)`, opacity: 0.5 }}
          animate={{ x: b.x, y: b.y, scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 14 + i * 3, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* sparkle glints */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={`s${i}`}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 31) % 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 2.5 + (i % 4), delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
