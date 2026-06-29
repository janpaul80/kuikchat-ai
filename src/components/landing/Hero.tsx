import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/hero.MP4";

export const Hero = () => {
  return (
    <section className="relative pt-20 min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      
      {/* Overlays for dark consistent styling and readability */}
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, hsl(217, 91%, 60%, 0.18) 0%, transparent 60%), radial-gradient(50% 50% at 80% 80%, hsl(142, 71%, 45%, 0.12) 0%, transparent 60%)",
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
          <Sparkles className="w-3.5 h-3.5 text-[hsl(217,91%,60%)]" />
          <span>Now with Hermes AI built-in.</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]"
        >
          Chat smarter,<br />
          <span className="bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(142,71%,45%)] bg-clip-text text-transparent">
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
          <Button variant="hero" size="xl" className="w-full sm:w-auto animate-pulse hover:animate-none" asChild>
            <Link to="/auth">
              Start for free <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="glass"
            size="xl"
            className="w-full sm:w-auto border-white/10 hover:bg-white/10"
            asChild
          >
            <Link to="/download">
              <Play className="w-4 h-4 mr-2" /> Download the app
            </Link>
          </Button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
};
