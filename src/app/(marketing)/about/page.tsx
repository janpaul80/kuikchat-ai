import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Bot,
  Code2,
  ExternalLink,
  FileText,
  Github,
  Globe2,
  LockKeyhole,
  MapPin,
  MessageSquare,
  Mic,
  MonitorDown,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GITHUB_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about KuikChat, Paul Hartmann, and the ecosystem behind the platform.',
}

type CardLink = {
  icon: LucideIcon
  title: string
  text: string
  href: string
  status?: string
}

const featureCards: CardLink[] = [
  {
    icon: MessageSquare,
    title: 'Smart Messaging',
    text: 'Private chats, group conversations, channels, and communities with a launch-ready messaging core.',
    href: '/features',
    status: 'Launch',
  },
  {
    icon: Sparkles,
    title: 'Hermes AI',
    text: 'AI assistance inside conversations for drafting, translation, summarization, and everyday workflow help.',
    href: '/features',
    status: 'Launch',
  },
  {
    icon: FileText,
    title: 'FileNinja Transfers',
    text: 'Secure file delivery for professional handoffs, client work, and creator workflows.',
    href: '/features',
    status: 'Launch',
  },
  {
    icon: Mic,
    title: 'Rev-Pro',
    text: 'Audio and video transcription workflows planned as KuikChat expands beyond messaging.',
    href: '/features',
    status: 'Coming Soon',
  },
  {
    icon: MonitorDown,
    title: 'Desktop Apps',
    text: 'Windows and macOS applications are now part of the platform roadmap for professional users.',
    href: '/download',
    status: 'Roadmap',
  },
  {
    icon: LockKeyhole,
    title: 'Privacy First',
    text: 'No phone number requirement, security-forward account design, and a public launch posture built around trust.',
    href: '/security',
    status: 'Launch',
  },
]

const projectCards: CardLink[] = [
  {
    icon: MessageSquare,
    title: 'KuikChat',
    text: 'Secure communication for personal, creator, and professional workflows.',
    href: '/features',
  },
  {
    icon: FileText,
    title: 'FileNinja',
    text: 'Secure transfer workflows for files, documents, and professional handoffs.',
    href: '/features',
  },
  {
    icon: Mic,
    title: 'Rev-Pro',
    text: 'Media, transcription, and future professional audio/video workflows.',
    href: '/features',
  },
  {
    icon: MonitorDown,
    title: 'Desktop Apps',
    text: 'Native-feeling Windows and macOS application planning.',
    href: '/download',
  },
  {
    icon: PlayCircle,
    title: 'VideoAgent',
    text: 'Future video intelligence, analysis, and summarization planning.',
    href: '/features',
  },
  {
    icon: ShieldCheck,
    title: 'Security',
    text: 'Launch posture, account safety, and secure integration controls.',
    href: '/security',
  },
  {
    icon: Bot,
    title: 'Hermes AI',
    text: 'AI assistance where conversations actually happen.',
    href: '/features',
  },
  {
    icon: Users,
    title: 'Communities',
    text: 'Groups, creators, teams, and collaboration spaces.',
    href: '/features',
  },
]

const founderFacts = [
  { icon: MapPin, text: 'Born in Queens, New York' },
  { icon: Globe2, text: 'Based in Europe' },
  { icon: Code2, text: 'Software Engineer' },
  { icon: Github, text: 'Open Source Builder' },
  { icon: ShieldCheck, text: 'Privacy Advocate' },
  { icon: Bot, text: 'AI & Productivity Enthusiast' },
]

const heroTrustItems: Array<[LucideIcon, string]> = [
  [Users, 'No phone number required'],
  [ShieldCheck, 'End-to-end encrypted'],
  [LockKeyhole, 'Built for personal and business'],
]

function ProductPreview() {
  const conversations = [
    ['Hermes AI', 'Hi Paul, how can I help you today?', '10:17 AM'],
    ['Project Phoenix', 'FileNinja QA plan.pdf', '9:49 AM'],
    ['Design Squad', 'Landing page polish pass', '9:32 AM'],
    ['Dev Community', 'Auth and launch readiness', '9:19 AM'],
  ]

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/80 p-4 shadow-2xl shadow-black/40">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-green-400/20 blur-3xl" />
      <div className="grid min-h-[380px] gap-4 lg:grid-cols-[0.75fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex items-center gap-2">
            <Image src="/logo.png" alt="" width={28} height={28} className="rounded-lg" />
            <p className="font-black">KuikChat</p>
          </div>
          <nav aria-label="Product preview navigation" className="space-y-2 text-sm">
            {['Chats', 'Communities', 'Channels', 'Calls', 'Files', 'Hermes AI'].map((item, index) => (
              <div
                key={item}
                className={
                  index === 0
                    ? 'rounded-xl bg-brand-gradient px-3 py-2 font-bold text-white'
                    : 'rounded-xl px-3 py-2 text-slate-400'
                }
              >
                {item}
              </div>
            ))}
          </nav>
        </div>

        <div className="grid gap-4 md:grid-cols-[0.72fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-500">
              Search chats...
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Pinned</p>
            <div className="space-y-3">
              {conversations.map(([name, preview, time], index) => (
                <div
                  key={name}
                  className={
                    index === 0
                      ? 'rounded-2xl border border-brand-green-300/30 bg-brand-green-300/10 p-3'
                      : 'rounded-2xl bg-white/[0.035] p-3'
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold">{name}</p>
                    <span className="text-[10px] text-slate-500">{time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{preview}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="font-black">Hermes AI</p>
                <p className="text-xs text-slate-500">AI Assistant</p>
              </div>
              <Sparkles className="h-5 w-5 text-brand-green-300" />
            </div>
            <div className="space-y-3">
              <div className="max-w-[85%] rounded-2xl bg-white/[0.06] px-4 py-3 text-sm">
                Hi Paul, how can I help you today?
              </div>
              <div className="ml-auto max-w-[78%] rounded-2xl bg-brand-green-500 px-4 py-3 text-sm font-bold text-white">
                Summarize this document for me
              </div>
              <div className="ml-auto flex max-w-[78%] items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm">
                <FileText className="h-5 w-5 text-brand-blue-300" />
                Project_Brief.pdf
              </div>
              <div className="max-w-[85%] rounded-2xl bg-brand-blue-500/20 px-4 py-3 text-sm leading-6">
                Here&apos;s a quick summary: project overview, key milestones, budget
                allocation, and risks.
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-500">
              Ask Hermes anything...
              <Send className="ml-auto h-4 w-4 text-brand-green-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ card }: { card: CardLink }) {
  const Icon = card.icon

  return (
    <Link
      href={card.href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 p-5 transition duration-300 hover:-translate-y-1 hover:cursor-pointer hover:border-brand-green-300/50 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-brand-green-500/10 focus:outline-none focus:ring-2 focus:ring-brand-green-300"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-green-400/0 blur-2xl transition group-hover:bg-brand-green-400/20" />
      <Sparkles className="pointer-events-none absolute right-5 top-5 h-4 w-4 text-brand-green-200 opacity-0 transition group-hover:opacity-100" />
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient shadow-lg shadow-brand-blue-950/30 transition group-hover:scale-105">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black">{card.title}</h3>
        {card.status ? (
          <Badge
            variant={card.status === 'Launch' ? 'success' : 'secondary'}
            className="shrink-0"
          >
            {card.status}
          </Badge>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{card.text}</p>
    </Link>
  )
}

function ProjectCard({ card }: { card: CardLink }) {
  const Icon = card.icon

  return (
    <Link
      href={card.href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:cursor-pointer hover:border-brand-blue-300/50 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-brand-blue-500/10 focus:outline-none focus:ring-2 focus:ring-brand-blue-300"
    >
      <div className="pointer-events-none absolute inset-x-8 -top-16 h-24 rounded-full bg-brand-blue-400/0 blur-2xl transition group-hover:bg-brand-blue-400/20" />
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand-blue-950/30 transition group-hover:rotate-3 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-black">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{card.text}</p>
    </Link>
  )
}

export default function AboutPage() {
  return (
    <main className="relative overflow-hidden bg-[#02070d] text-white">
      <div className="pointer-events-none absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-brand-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-[520px] w-[520px] rounded-full bg-brand-green-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_35%)]" />

      <section className="relative px-4 pb-12 pt-24 sm:pb-16 sm:pt-32">
        <div className="container mx-auto grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue-300">
              About KuikChat
            </p>
            <h1 className="mt-5 text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Communication without <span className="text-brand-gradient">limits.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              KuikChat is a secure, modern, and intelligent communication platform
              built for people, teams, creators, and businesses. It brings messaging,
              AI assistance, secure file transfer, communities, desktop planning, and
              media workflows into one calm place to get things done.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {heroTrustItems.map(([Icon, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-brand-green-300/40 hover:bg-white/[0.07]"
                >
                  <Icon className="mb-3 h-5 w-5 text-brand-green-300" />
                  <p className="text-sm font-bold leading-5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section className="relative px-4 py-10">
        <div className="container mx-auto rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Everything you need in one place
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">
              Every card below is a real link with visible hover feedback, keyboard focus,
              and launch-ready routing.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((card) => (
              <FeatureCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-10">
        <div className="container mx-auto grid overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[0.75fr_1fr_0.8fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-2xl" />
            <Image
              src="/founder2.png"
              alt="Paul Hartmann"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          <div className="p-7 sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue-300">
              Founder
            </p>
            <h2 className="mt-3 text-3xl font-black">Paul Hartmann</h2>
            <p className="mt-1 text-lg text-slate-300">
              Founder, Software Engineer, Builder
            </p>
            <div className="mt-6 space-y-4 leading-7 text-slate-300">
              <p>
                Hi, I&apos;m Paul Hartmann. I&apos;m a software engineer and entrepreneur
                with a passion for building products that empower people and solve
                real problems.
              </p>
              <p>
                I was born and raised in Queens, New York, and later moved to Europe
                where I continue building technology that makes a difference.
              </p>
              <p>
                KuikChat is one part of a larger ecosystem of products I&apos;m building
                to help individuals, creators, and businesses work smarter,
                communicate better, and stay in control of their data.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-7 sm:p-10 lg:border-l lg:border-t-0">
            <div className="grid gap-4">
              {founderFacts.map((fact) => {
                const Icon = fact.icon
                return (
                  <div key={fact.text} className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07] text-brand-green-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-bold text-slate-200">{fact.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-10">
        <div className="container mx-auto rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-black">Projects I&apos;m Working On</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {projectCards.map((card) => (
              <ProjectCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 pb-24 pt-10">
        <div className="container mx-auto rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-5">
              <div className="hidden h-16 w-16 items-center justify-center rounded-3xl bg-brand-gradient shadow-lg shadow-brand-blue-950/30 sm:flex">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Support Open Development</h2>
                <p className="mt-2 max-w-2xl text-slate-300">
                  KuikChat is built with open-source technologies and community support.
                  If you like what we&apos;re building, consider giving us a star on GitHub.
                </p>
              </div>
            </div>

            <Button asChild className="rounded-2xl bg-brand-gradient px-7 py-6 text-base font-black text-white shadow-xl shadow-brand-blue-950/30 transition hover:-translate-y-0.5 hover:shadow-brand-green-500/25">
              <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
                <Github className="h-5 w-5" />
                ⭐ Give Us A Star On GitHub
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
