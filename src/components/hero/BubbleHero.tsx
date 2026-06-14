"use client";

import { BubbleBackground } from "@/components/animate-ui/components/backgrounds/bubble";
import { motion } from "framer-motion";

/**
 * KuikChat cinematic hero using Animate UI's Bubble background.
 * SAME animation on every page — only the copy changes per page.
 *
 * Usage:
 *   import BubbleHero from "@/components/hero/BubbleHero";
 *   import { heroCopy } from "@/lib/heroCopy";
 *   <BubbleHero {...heroCopy.pricing} />
 *
 * Deps (run once):
 *   npx shadcn@latest add @animate-ui/backgrounds-bubble
 *   (also requires: framer-motion / motion)
 */

type BubbleHeroProps = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  /** allow mouse interaction with the bubbles */
  interactive?: boolean;
  className?: string;
};

export default function BubbleHero({
  eyebrow,
  title,
  subtitle,
  interactive = true,
  className = "",
}: BubbleHeroProps) {
  return (
    <section
      className={`relative w-full overflow-hidden bg-[#04100c] ${className}`}
      style={{ minHeight: "80vh" }}
    >
      {/* Animated bubble background, tinted to KuikChat brand blue->green */}
      <BubbleBackground
        interactive={interactive}
        className="absolute inset-0"
        // Brand gradient + bubble colors (blue -> cyan -> green)
        colors={{
          first: "37,99,235",     // blue-600
          second: "16,185,129",   // emerald-500
          third: "34,211,238",    // cyan-400
          fourth: "20,184,166",   // teal-500
          fifth: "59,130,246",    // blue-500
          sixth: "5,150,105",     // emerald-600
        }}
      />

      {/* readability overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#04100c]/90" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Per-page copy */}
      <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 rounded-full border border-emerald-400/20 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-100 backdrop-blur-md"
          >
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
