"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

/**
 * KuikChat — Hero (Next.js App Router, dark, video background)
 * Path: src/components/landing/Hero.tsx
 * Video: /public/kuikchat.mp4  ->  served at "/kuikchat.mp4"
 */
export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-black">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/kuikchat.mp4"
        poster="/kuikchat-poster.jpg"
        autoPlay muted loop playsInline preload="auto" aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 50% 30%, hsl(217 91% 60% / 0.18) 0%, transparent 60%), radial-gradient(50% 50% at 80% 80%, hsl(142 71% 45% / 0.12) 0%, transparent 60%)" }}
      />
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm text-white/80 mb-7">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(217,91%,60%)]" /> Now with Hermes AI built in
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
          Chat smarter.<br />
          <span className="bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(142,71%,45%)] bg-clip-text text-transparent">Work faster.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-white/70">
          KuikChat is a real-time messaging platform with AI, file tools, and interactive cards built in — across web, desktop, and mobile.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(142,71%,45%)] hover:opacity-90 transition-opacity">
            Start free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/download" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
            <Play className="w-4 h-4" /> Download app
          </Link>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
}
