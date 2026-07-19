import { Sparkles, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Hero = () => {
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm text-white/80 mb-7 mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(217,91%,60%)]" />
          <span>Now with Hermes AI built-in.</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
          Chat smarter,<br />
          <span className="bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(142,71%,45%)] bg-clip-text text-transparent">
            work faster.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl mx-auto text-lg text-white/70">
          KuikChat is a real-time messaging platform: AI-powered assistants, secure file tools, and interactive cards are all built right in. Use it on the web, your desktop, or your mobile device.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/auth"
            className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(217_91%_60%)_0%,hsl(142_71%_45%)_100%)] px-10 text-lg font-medium text-white shadow-xl transition-[transform,box-shadow,filter] duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Start for free <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
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
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
};
