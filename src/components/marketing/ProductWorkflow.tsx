'use client'

import Link from 'next/link'
import {
  Bot,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Mic,
  PlayCircle,
  Send,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const chatItems = [
  {
    actor: 'Hermes',
    text: "I've summarized this client thread for you. I can also draft a reply or prepare the file handoff whenever you're ready.",
    align: 'left',
    tone: 'bot',
  },
  {
    actor: 'You',
    text: "Thanks. Go ahead and send the final brand files through FileNinja, then give me a quick recap.",
    align: 'right',
    tone: 'user',
  },
  {
    actor: 'FileNinja',
    text: 'Secure transfer complete. Your download link is ready and will expire in 24 hours.',
    align: 'left',
    tone: 'secure',
  },
  {
    actor: 'Rev-Pro',
    text: 'Meeting audio is processed and ready for your transcription and media notes.',
    align: 'left',
    tone: 'media',
  },
  {
    actor: 'Hermes',
    text: "Recap: all assets are approved, the launch copy is pending, and the final legal review is due this Friday.",
    align: 'left',
    tone: 'bot',
  },
]

const workflowHighlights = [
  {
    icon: FileText,
    label: 'FileNinja',
    value: 'Secure delivery',
    status: 'Launch',
  },
  {
    icon: Mic,
    label: 'Rev-Pro',
    value: 'Media workflow',
    status: 'Coming Soon',
  },
  {
    icon: PlayCircle,
    label: 'VideoAgent',
    value: 'Video intelligence',
    status: 'Future',
  },
]

function ChatBubble({ item }: { item: (typeof chatItems)[number] }) {
  const isRight = item.align === 'right'

  return (
    <div className={isRight ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          isRight
            ? 'max-w-[82%] rounded-2xl rounded-tr-md bg-[#0b746d] px-4 py-3 text-white shadow-lg'
            : 'max-w-[84%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[#092227] shadow-sm'
        }
      >
        <div
          className={
            isRight
              ? 'mb-1 text-[11px] font-black text-white/75'
              : 'mb-1 flex items-center gap-1.5 text-[11px] font-black text-[#0a756f]'
          }
        >
          {!isRight && item.tone === 'bot' ? <Bot className="h-3 w-3" /> : null}
          {!isRight && item.tone === 'secure' ? <LockKeyhole className="h-3 w-3" /> : null}
          {!isRight && item.tone === 'media' ? <Mic className="h-3 w-3" /> : null}
          {item.actor}
        </div>
        <p className="text-[12px] font-semibold leading-5">{item.text}</p>
      </div>
    </div>
  )
}

export function ProductWorkflow() {
  return (
    <section className="overflow-hidden bg-black px-4 py-20 text-white sm:py-28">
      <div className="container mx-auto grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative mx-auto min-h-[640px] w-full max-w-[680px] sm:min-h-[620px]">
          <div className="pointer-events-none absolute left-0 top-8 hidden text-[4.9rem] font-black uppercase leading-[0.86] tracking-widest text-white/[0.08] xl:block [writing-mode:vertical-rl]">
            #private #efficient
          </div>

          <div className="absolute left-2 top-20 hidden w-[255px] rounded-[42px] border border-white/60 bg-slate-950 p-2 shadow-2xl shadow-black/50 md:block xl:w-[285px]">
            <div className="relative min-h-[520px] overflow-hidden rounded-[38px] bg-[#0d5b58]">
              <div className="absolute inset-y-0 left-0 w-[45%] bg-[#08756d]" />
              <div className="relative flex min-h-[520px] flex-col justify-between p-7">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="KuikChat" className="h-12 w-12 rounded-2xl shadow-lg" />
                  <div>
                    <p className="text-lg font-black">KuikChat</p>
                    <p className="text-xs font-semibold text-white/70">Application with AI</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-white/70">Private communication</p>
                  <h3 className="mt-3 text-3xl font-black leading-[0.95]">
                    Messaging, AI, and secure transfer in one place.
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-6 text-white/80">
                    Built for people, teams, creators, and professionals.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-full border border-white/45 px-5 py-3 text-sm font-black">
                  Let&apos;s chat
                  <Send className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-2 top-0 w-[330px] rounded-[52px] border border-white/70 bg-slate-950 p-2 shadow-2xl shadow-black/60 sm:w-[350px] md:w-[340px] lg:w-[335px] xl:w-[360px]">
            <div className="relative min-h-[610px] overflow-hidden rounded-[44px] bg-[#eef3f2] text-[#092227]">
              <div className="absolute left-1/2 top-0 h-6 w-28 -translate-x-1/2 rounded-b-3xl bg-slate-950" />

              <div className="flex items-center justify-between px-6 pb-4 pt-8">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black shadow-sm">
                  ‹
                </button>
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="KuikChat" className="h-8 w-8 rounded-xl" />
                  <p className="text-lg font-black text-[#0b5f5a]">KuikChat</p>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <Send className="h-4 w-4 text-[#0b5f5a]" />
                </button>
              </div>

              <div className="mx-5 h-[438px] overflow-hidden rounded-[30px] border border-black/5 bg-[#f8fbfa] p-4 shadow-inner">
                <div className="animate-[kuik-chat-scroll_13s_linear_infinite] space-y-3">
                  {[...chatItems, ...chatItems].map((item, index) => (
                    <ChatBubble key={`${item.actor}-${index}`} item={item} />
                  ))}
                </div>
              </div>

              <div className="absolute inset-x-5 bottom-5 flex items-center gap-3">
                <div className="flex h-12 flex-1 items-center rounded-full bg-white px-5 text-sm font-bold text-slate-400 shadow-sm">
                  Write a message
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0b746d] shadow-lg">
                  <Mic className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 grid w-full max-w-[620px] -translate-x-1/2 grid-cols-3 gap-3 md:-bottom-4">
            {workflowHighlights.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/75 p-3 shadow-xl shadow-black/30 backdrop-blur-xl animate-[kuik-card-lift_6s_ease-in-out_infinite]"
                  style={{ animationDelay: `${index * 0.8}s` }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Icon className="h-4 w-4 text-brand-green-300" />
                    <Badge
                      variant={item.status === 'Launch' ? 'success' : 'secondary'}
                      className="px-2 py-0.5 text-[9px]"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-black">{item.label}</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-400">{item.value}</p>
                </div>
              )
            })}
          </div>

          <div className="pointer-events-none absolute right-0 top-24 hidden rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:block lg:right-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="h-4 w-4 text-brand-green-300" />
              File delivered
            </div>
            <p className="mt-1 text-xs text-slate-400">Secure link expires in 24 hours</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-green-300">
            Real workflows, not just chat bubbles.
          </p>
          <h2 className="mt-4 text-balance text-3xl font-black tracking-tight sm:text-5xl">
            KuikChat: where conversation turns into action.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Our platform brings together secure messaging, no-phone-number accounts, Hermes AI,
            FileNinja delivery, and media workflow planning into one calm communication
            layer built for people, teams, and professionals.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              ['Secure messaging', 'Maintain truly private conversations with clear account ownership.'],
              ['Hermes integrated AI', 'Draft, summarize, translate, and assist — all right in the context of your chat.'],
              ['FileNinja delivery', 'Professional file transfers without ever exposing raw storage links.'],
              ['Roadmap: Rev-Pro & VideoAgent', 'Upcoming support for transcription, media workflows, and future video intelligence.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="gradient" size="lg" asChild>
              <Link href="/signup">Create your account</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/features">See features</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
