import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

export default function HeroSection({ onAuthClick }: HeroSectionProps) {
  return (
    <section className="relative pt-20 min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      
      {/* Overlays for dark consistent styling and readability */}
      <div className="absolute inset-0 bg-black/75 z-0" />
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(50% 50% at 80% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Sparkles Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm text-white/80 mb-7 mx-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Now with Gemini AI built-in.</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]"
        >
          Chat smarter,<br />
          <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            work faster.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-white/70"
        >
          KuikChat is a real-time messaging platform: AI-powered assistants, secure file tools, and interactive cards are all built right in. Use it on the web, your desktop, or your mobile device.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={() => onAuthClick('signup')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onAuthClick('login')}
            className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Try Web App
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
}
