"use client";
import GlowBackground from "@/components/ui/GlowBackground";

/**
 * Reusable hero wrapper for NON-landing pages (Pricing, Features, Security, etc.)
 * The LANDING page keeps its kuikchat.mp4 video and must NOT use this.
 *
 * Example:
 *   <SubpageHero title="Pricing" subtitle="Simple plans for everyone" />
 */
export default function SubpageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <GlowBackground />
      <div className="relative z-10 container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl mx-auto text-lg text-white/65">{subtitle}</p>}
      </div>
    </section>
  );
}
