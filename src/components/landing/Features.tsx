"use client";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, FileText, TrendingUp, Shield, LayoutGrid } from "lucide-react";

/** KuikChat — Features (Next.js) with brand-color hover. Path: src/components/landing/Features.tsx */
const features = [
  { icon: MessageCircle, title: "Real-time messaging", description: "Experience instant 1:1 and group chats with reactions, replies, edits, and read receipts." },
  { icon: Sparkles, title: "Hermes AI", description: "Your personal assistant in every conversation: summaries, drafts, translation, and answers." },
  { icon: FileText, title: "FileNinja", description: "Share, preview, and act on files without ever leaving the chat environment." },
  { icon: TrendingUp, title: "RevDev Pro", description: "Turn your conversations into revenue with built-in commerce and developer tooling." },
  { icon: Shield, title: "Secure by design", description: "We prioritize your privacy with Supabase-backed authentication, signed URLs, and isolated storage." },
  { icon: LayoutGrid, title: "Interactive cards", description: "Polls, events, live locations, and contact cards — all rendered right in the chat." },
];
const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Features() {
  return (
    <section id="features" className="relative bg-black py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-medium bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(142,71%,45%)] bg-clip-text text-transparent">Powerful features</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-white">Everything in one place.</h2>
          <p className="mt-4 text-white/60">A messaging platform designed to actually help you get work done.</p>
        </div>
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <motion.div key={f.title} variants={item}
              className="group relative p-6 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[hsl(217,91%,60%,0.5)] hover:shadow-[0_20px_50px_-12px_hsl(217,91%,60%,0.35)]">
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ background: "radial-gradient(120% 120% at 0% 0%, hsl(217 91% 60% / 0.12), transparent 50%), radial-gradient(120% 120% at 100% 100%, hsl(142 71% 45% / 0.12), transparent 50%)" }} />
              <div className="relative">
                <div className="grid place-items-center w-11 h-11 rounded-xl text-white mb-4 transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br from-[hsl(217,91%,60%)] to-[hsl(142,71%,45%)]">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
