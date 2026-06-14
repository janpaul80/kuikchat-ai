"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, FileText, TrendingUp, ShieldCheck, Github, Star, Monitor, Apple, Smartphone, TrendingUp as Biz, User, Code2, Boxes } from "lucide-react";

/**
 * KuikChat — About content (premium dark).
 *  - Founder PHOTO instead of placeholder icon (public/jphart.png)
 *  - NO local <Footer /> (the (marketing) layout already injects it -> fixes the double footer)
 *  - Animated brand glow background behind the hero.
 *
 * TEAM: confirm the founder photo filename in /public and update the src below if different.
 */
const GITHUB_URL = "https://github.com/janpaul80/kuikchat-ai";
const GRAD = "bg-gradient-to-br from-[hsl(217,91%,60%)] to-[hsl(142,71%,45%)]";
const GRADTEXT = "bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(142,71%,45%)] bg-clip-text text-transparent";

const integrations = [
  { icon: Sparkles, name: "Hermes AI", desc: "A built-in AI assistant in every conversation — summaries, drafts, translation, coding help, and instant answers without leaving the chat." },
  { icon: FileText, name: "FileNinja", desc: "Share, preview and act on files inline. Signed and stored securely — no clunky attachments, no context switching." },
  { icon: TrendingUp, name: "RevDev Pro", desc: "Turn conversations into outcomes with built-in commerce and developer tooling — ship and sell from where you already talk." },
];
const useCases = {
  personal: ["Private 1:1 and group chats", "Disappearing & vanish-mode messages", "Polls, events, live location & contact cards", "AI translation across 6+ languages"],
  business: ["Team channels with realtime sync", "Hermes AI for summaries & drafting", "FileNinja for secure document workflows", "RevDev Pro for commerce & automation"],
};
const founderTags = [{ icon: Code2, label: "Software Engineering" }, { icon: Github, label: "Open Source" }, { icon: Boxes, label: "Multiple AI Projects" }];
const platforms = [
  { icon: Monitor, name: "Windows", cta: "Download for Windows", available: true },
  { icon: Apple, name: "macOS", cta: "Download for macOS", available: true },
  { icon: Smartphone, name: "Android", cta: "Coming Soon", available: false },
  { icon: Apple, name: "iOS", cta: "Coming Soon", available: false },
];

function S({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className={`container mx-auto px-6 ${className}`}>
      {children}
    </motion.section>
  );
}

export default function AboutContent() {
  return (
    <main className="min-h-screen bg-black text-white">
      <S className="pt-16 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {([["For personal use", useCases.personal, User], ["For business", useCases.business, Biz]] as const).map(([title, items, Icon]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className={`grid place-items-center w-10 h-10 rounded-xl text-white ${GRAD}`}><Icon className="w-5 h-5" /></div>
                <h3 className="text-xl font-semibold">{title}</h3>
              </div>
              <ul className="space-y-3">
                {items.map((t) => (<li key={t} className="flex items-start gap-2.5 text-white/70"><span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${GRAD}`} /> {t}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </S>

      <S className="py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className={`text-sm font-medium ${GRADTEXT}`}>Built in, not bolted on</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">The KuikChat suite</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {integrations.map((it) => (
            <div key={it.name} className="group relative p-7 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[hsl(217,91%,60%,0.5)] hover:shadow-[0_20px_50px_-12px_hsl(217,91%,60%,0.35)]">
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "radial-gradient(120% 120% at 0% 0%, hsl(217 91% 60% / 0.12), transparent 50%), radial-gradient(120% 120% at 100% 100%, hsl(142 71% 45% / 0.12), transparent 50%)" }} />
              <div className="relative">
                <div className={`grid place-items-center w-12 h-12 rounded-xl text-white mb-4 transition-transform duration-300 group-hover:scale-110 ${GRAD}`}><it.icon className="w-6 h-6" /></div>
                <h3 className="text-lg font-semibold mb-2">{it.name}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </S>

      <S className="py-16">
        <div className="rounded-3xl border border-white/10 p-10 md:p-14" style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.10), hsl(142 71% 45% / 0.06))" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`grid place-items-center w-11 h-11 rounded-xl text-white ${GRAD}`}><ShieldCheck className="w-5 h-5" /></div>
            <h2 className="text-2xl md:text-3xl font-bold">Privacy & ownership</h2>
          </div>
          <p className="max-w-3xl text-white/70 leading-relaxed">Your conversations are yours. KuikChat is built privacy-first: secure authentication, signed storage URLs, and isolated buckets mean your data isn't a product to be sold. We believe AI should amplify you while you keep ownership and control of everything you share.</p>
        </div>
      </S>

      {/* Founder with PHOTO */}
      <S className="py-16">
        <div className="grid md:grid-cols-[280px_1fr] gap-10 items-start rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <div className="text-center md:text-left">
            <div className="relative w-40 h-40 mx-auto md:mx-0 rounded-2xl overflow-hidden mb-5 ring-2 ring-[hsl(217,91%,60%,0.4)]">
              <Image src="/jphart.png" alt="Paul Hartmann" fill sizes="160px" className="object-cover" />
            </div>
            <h3 className="text-xl font-bold">Paul Hartmann</h3>
            <p className="text-sm text-white/50">Founder & Software Engineer</p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {founderTags.map((t) => (<span key={t.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/70"><t.icon className="w-3 h-3" /> {t.label}</span>))}
            </div>
          </div>
          <div className="space-y-4 text-white/70 leading-relaxed">
            <span className={`text-sm font-medium ${GRADTEXT}`}>The founder story</span>
            <p>KuikChat was founded by <strong className="text-white">Paul Hartmann</strong>, a software engineer who has spent years building full-stack products and contributing to open source. Frustrated by messaging tools that treated AI as an afterthought and privacy as a checkbox, he set out to build something different.</p>
            <p>Paul's work spans modern web platforms, real-time systems, and a growing portfolio of AI projects. KuikChat brings that experience together — Hermes AI, FileNinja, and RevDev Pro all reflect a single belief: powerful tools should feel effortless and respect the people using them.</p>
            <p>KuikChat is <strong className="text-white">one of several projects</strong> Paul is actively building — part of a broader mission to ship practical, privacy-respecting AI software that people genuinely enjoy using.</p>
          </div>
        </div>
      </S>

      <S className="py-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <Github className="w-10 h-10 mx-auto text-white mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold">KuikChat is built in the open</h2>
          <p className="mt-3 text-white/65 max-w-xl mx-auto">If you like what we're building, give us a star on GitHub — it genuinely helps.</p>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={`mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity ${GRAD}`}>
            <Star className="w-4 h-4" /> Star on GitHub
          </a>
        </div>
      </S>

      <S className="py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">Get KuikChat everywhere</h2>
          <p className="mt-3 text-white/60">Web today. Desktop and mobile rolling out now.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {platforms.map((p) => (
            <div key={p.name} className={`p-6 rounded-2xl border text-center ${p.available ? "border-white/10 bg-white/[0.03]" : "border-white/5 bg-white/[0.02] opacity-70"}`}>
              <div className="grid place-items-center w-12 h-12 mx-auto rounded-xl bg-white/5 text-white mb-4"><p.icon className="w-6 h-6" /></div>
              <h3 className="font-semibold mb-3">{p.name}</h3>
              <button disabled={!p.available} className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-opacity ${p.available ? "text-white hover:opacity-90 " + GRAD : "bg-white/5 text-white/40 cursor-not-allowed"}`}>{p.cta}</button>
            </div>
          ))}
        </div>
      </S>

      <div className="h-10" />
      {/* NO <Footer /> here — the (marketing) layout already renders it */}
    </main>
  );
}
