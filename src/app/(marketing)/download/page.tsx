import type { Metadata } from 'next'
import BubbleHero from '@/components/hero/BubbleHero'
import { heroCopy } from '@/lib/heroCopy'
import Link from 'next/link'
import {
  Apple,
  Bell,
  Download,
  ExternalLink,
  Laptop,
  LockKeyhole,
  MonitorDown,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Download',
  description: 'Download KuikChat for desktop and follow the roadmap for Android and iOS.',
}

const desktopApps = [
  {
    icon: MonitorDown,
    platform: 'Windows',
    label: 'Download for Windows (.exe)',
    status: 'Coming Soon',
    description: 'Native-feeling Windows app with secure sessions, notifications, and deep-link planning.',
  },
  {
    icon: Apple,
    platform: 'macOS',
    label: 'Download for macOS',
    status: 'Coming Soon',
    description: 'Native-feeling macOS app with auto-update planning and system notification support.',
  },
]

const capabilities: Array<[string, LucideIcon]> = [
  ['Messaging and communities', Laptop],
  ['Hermes AI inside workflows', ShieldCheck],
  ['FileNinja secure transfers', LockKeyhole],
  ['Rev-Pro media workflows', Download],
  ['Auto-update capability', RefreshCcw],
  ['System notifications', Bell],
]

export default function DownloadPage() {
  return (
    <main className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-44 h-[420px] w-[420px] rounded-full bg-brand-green-500/15 blur-3xl" />

      <BubbleHero {...heroCopy.download} className="min-h-[70vh]" />

      <section className="relative px-4 pb-16">
        <div className="container mx-auto grid gap-6 lg:grid-cols-2">
          {desktopApps.map((app) => {
            const Icon = app.icon
            return (
              <div
                key={app.platform}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-lg shadow-brand-blue-950/30">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <Badge className="border-white/15 bg-white/10 text-white">{app.status}</Badge>
                </div>
                <h2 className="mt-6 text-3xl font-black">{app.platform}</h2>
                <p className="mt-3 min-h-16 leading-7 text-slate-300">{app.description}</p>
                <Button
                  disabled
                  className="mt-7 w-full cursor-not-allowed rounded-2xl border border-white/15 bg-white/10 py-6 text-white opacity-70"
                >
                  <Download className="h-5 w-5" />
                  {app.label}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="relative px-4 py-12">
        <div className="container mx-auto rounded-[28px] border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue-300">
                Desktop architecture roadmap
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Native-feeling apps for daily communication.
              </h2>
              <p className="mt-5 leading-8 text-slate-300">
                Our desktop architecture is designed to provide native-feeling experiences for both Windows and macOS, including secure storage, an automated updater strategy, notifications, and deep links.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map(([label, Icon]) => (
                <div key={label as string} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
                  <Icon className="mb-4 h-6 w-6 text-brand-green-300" />
                  <p className="font-bold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-12">
        <div className="container mx-auto grid gap-5 sm:grid-cols-2">
          {([
            ['Android', 'Native React Native APK', 'Coming soon'],
            ['iOS', 'Native app', 'Coming soon'],
          ] as Array<[string, string, string]>).map(([platform, description, status]) => (
            <div key={platform} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-7">
              <Smartphone className="h-8 w-8 text-brand-green-300" />
              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">{platform}</h2>
                  <p className="mt-2 text-slate-400">{description}</p>
                </div>
                <Badge className="border-white/15 bg-white/10 text-white">{status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative px-4 pb-24 pt-10">
        <div className="container mx-auto rounded-[28px] border border-white/10 bg-gradient-to-r from-brand-blue-600 to-brand-green-500 p-8 text-center shadow-2xl shadow-brand-blue-950/30 sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">Use KuikChat on the web today.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">
            Desktop installers are coming soon as part of our launch stabilization roadmap. For now, the KuikChat Web experience is our primary focus.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-2xl bg-white text-slate-950 hover:bg-white/90">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/about">
                Learn About KuikChat
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
