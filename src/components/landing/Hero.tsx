import { motion } from "framer-motion";
import { MessageCircle, Shield, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const floatingElements = [
  { icon: "👋", delay: 0, position: "top-20 left-[10%]" },
  { icon: "💬", delay: 1, position: "top-32 right-[15%]" },
  { icon: "🎨", delay: 2, position: "bottom-32 left-[20%]" },
  { icon: "🔒", delay: 0.5, position: "bottom-40 right-[10%]" },
  { icon: "✨", delay: 1.5, position: "top-48 left-[30%]" },
];

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Floating Elements */}
      {floatingElements.map((el, i) => (
        <motion.div
          key={i}
          className={`absolute ${el.position} text-4xl hidden lg:block`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: el.delay, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: el.delay }}
          >
            {el.icon}
          </motion.div>
        </motion.div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Communication Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            The Future of{" "}
            <span className="brand-gradient-text">Communication</span>
            <br />
            Powered by AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Privacy-first, lightning-fast, and packed with AI superpowers for every conversation. 
            Your Communication Command Center is here.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/chat">
                <MessageCircle className="mr-2" />
                Join the Revolution
              </Link>
            </Button>
            <Button variant="glass" size="xl">
              <Play className="mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {[
              { icon: Shield, text: "End-to-End Encrypted" },
              { icon: Sparkles, text: "AI Assistant Built-in" },
              { icon: MessageCircle, text: "Cross-Platform Sync" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Chat Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="glass rounded-2xl p-1 shadow-2xl">
            <div className="bg-card rounded-xl p-4 sm:p-6">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-primary-foreground font-bold">
                  AI
                </div>
                <div>
                  <h4 className="font-semibold">KuikChat AI</h4>
                  <p className="text-xs text-muted-foreground">Always online • Powered by AI</p>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="py-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    AI
                  </div>
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs sm:max-w-md">
                    <p className="text-sm">Hello! I'm your AI assistant. How can I help you today? ✨</p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex gap-3 justify-end"
                >
                  <div className="brand-gradient rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs sm:max-w-md">
                    <p className="text-sm text-primary-foreground">Can you help me translate a message to Spanish?</p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    AI
                  </div>
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs sm:max-w-md">
                    <p className="text-sm">Of course! Just send me the message and I'll translate it instantly. 🌍</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
