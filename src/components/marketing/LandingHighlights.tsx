import Link from 'next/link'
import {
  Apple,
  Bot,
  FileText,
  LockKeyhole,
  MonitorDown,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const HIGHLIGHTS = [
  {
    icon: Bot,
    title: 'Hermes AI',
    description: 'AI assistance where conversations actually happen.',
    status: 'Launch',
  },
  {
    icon: FileText,
    title: 'FileNinja',
    description: 'Secure file delivery for professional handoffs.',
    status: 'Launch',
  },
  {
    icon: ShieldCheck,
    title: 'Rev-Pro',
    description: 'Transcription and media workflow readiness.',
    status: 'Coming Soon',
  },
  {
    icon: MonitorDown,
    title: 'Desktop apps',
    description: 'Windows and macOS apps are now part of the platform roadmap.',
    status: 'Coming Soon',
  },
  {
    icon: PlayCircle,
    title: 'VideoAgent',
    description: 'Future video analysis and summarization path.',
    status: 'Future',
  },
]

const mobilePlatforms: Array<[string, string, string, LucideIcon]> = [
  ['Android', 'Native APK after launch stabilization', 'Coming Soon', Smartphone],
  ['iOS', 'Future native app path', 'Coming Soon', Smartphone],
]

export function LandingHighlights() {
  return (
    <section className="bg-black px-4 py-20 text-white sm:py-24">
      <div className="container mx-auto">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-green-300">
              Ecosystem
            </p>
            <h2 className="mt-4 text-balance text-3xl font-black tracking-tight sm:text-5xl">
              Connecting the entire KuikChat ecosystem.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              While our initial launch stays focused on the core experience, our roadmap includes FileNinja, Rev-Pro, VideoAgent, and native desktop and mobile apps - all sharing the same trusted backend services.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-2xl bg-white text-slate-950 hover:bg-white/90">
                <Link href="/download">
                  <MonitorDown className="h-4 w-4" />
                  Download for Windows
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link href="/download">
                  <Apple className="h-4 w-4" />
                  Download for macOS
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-green-300/40"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant={item.status === 'Launch' ? 'success' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-brand-green-300">
              <LockKeyhole className="h-4 w-4" />
              Security preview:
            </div>
            <p className="mt-2 max-w-3xl text-slate-400">
              Our public launch posture includes zero phone number requirements, server-side secrets, protected routes, and clear feature flags.
            </p>
          </div>
          <Link
            href="/security"
            className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-bold transition-colors hover:bg-white/10"
          >
            View security
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mobilePlatforms.map(([platform, description, status, Icon]) => (
            <div key={platform} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-green-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold">{platform}</p>
                    <p className="text-sm text-slate-400">{description}</p>
                  </div>
                </div>
                <Badge variant="secondary">{status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
