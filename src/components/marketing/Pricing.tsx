'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { TIERS } from '@/lib/plans'

const comparison = [
  ['Private messaging', 'Included', 'Included', 'Included'],
  ['Hermes AI', 'Daily allowance', 'Expanded', 'Team-ready'],
  ['FileNinja transfers', 'Basic', 'Larger files', 'Team handoffs'],
  ['Desktop apps', 'Roadmap', 'Roadmap', 'Roadmap'],
  ['Rev-Pro workflows', 'Coming Soon', 'Coming Soon', 'Coming Soon'],
]

const faqs = [
  {
    question: 'What is KuikChat?',
    answer:
      'KuikChat is a private communication platform for messaging, AI assistance, secure file delivery, communities, and professional workflows.',
  },
  {
    question: 'Are paid plans available at launch?',
    answer:
      'Paid plan capabilities are staged. Anything not fully available before billing is enabled should remain clearly marked Coming Soon.',
  },
  {
    question: 'Do I need a phone number?',
    answer:
      'No. KuikChat is designed around email and username accounts, so users can join without phone-number dependency.',
  },
  {
    question: 'Will desktop apps be included?',
    answer:
      'Windows and macOS desktop applications are now part of the roadmap, with native-feeling notifications, secure session storage, deep links, and auto-update planning.',
  },
  {
    question: 'Can teams use FileNinja and Rev-Pro?',
    answer:
      'FileNinja is part of the secure transfer direction. Rev-Pro workflows are planned as staged media and transcription capabilities.',
  },
]

export function Pricing() {
  return (
    <main className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-brand-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-[380px] w-[420px] rounded-full bg-brand-green-500/12 blur-3xl" />

      <section id="pricing" className="relative px-4 pb-16 pt-24 sm:pb-24 sm:pt-32">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-green-300">
              Pricing
            </p>
            <h1 className="mt-5 text-balance text-4xl font-black tracking-tight sm:text-6xl">
              Flexible pricing,
              <span className="block text-white/55">built for people, teams, and builders.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Start for free, upgrade when you need more, and follow our roadmap as we roll out new capabilities.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3">
            {TIERS.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className={cn(
                  'relative overflow-hidden rounded-[28px] border bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl',
                  tier.highlight
                    ? 'border-brand-green-400/50 bg-brand-green-400/[0.08]'
                    : 'border-white/10'
                )}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">{tier.name}</h2>
                      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                        {tier.description}
                      </p>
                    </div>
                    {tier.highlight ? (
                      <Badge className="border-brand-green-300/30 bg-brand-green-300/15 text-brand-green-100">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Most Popular
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mb-6 flex items-end gap-1">
                    <span className="text-4xl font-black">{tier.price}</span>
                    <span className="pb-1 text-xs text-slate-400">{tier.period}</span>
                  </div>

                  <Button
                    asChild
                    className={cn(
                      'mb-6 w-full rounded-xl',
                      tier.highlight
                        ? 'bg-brand-green-500 text-white hover:bg-brand-green-400'
                        : 'border border-white/15 bg-white/8 text-white hover:bg-white/12'
                    )}
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>

                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-white/80">
                    What&apos;s included:
                  </p>
                  <ul className="space-y-3">
                    {tier.perks.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Compare plans and features
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              A detailed look at what each plan supports as the KuikChat ecosystem grows.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
            {comparison.map((row) => (
              <div
                key={row[0]}
                className="grid grid-cols-4 gap-3 border-b border-white/10 px-4 py-4 text-sm last:border-b-0 sm:px-6"
              >
                <div className="font-bold text-white">{row[0]}</div>
                {row.slice(1).map((cell, index) => (
                  <div key={`${row[0]}-${index}`} className="text-slate-300">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-16 sm:py-24">
        <div className="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-green-300">
              FAQ
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-5 text-slate-400">
              Common questions about our pricing, roadmap, and core features.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                  <span>{faq.question}</span>
                  <HelpCircle className="h-5 w-5 shrink-0 text-brand-green-300 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-4 leading-7 text-slate-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 pb-24">
        <div className="container mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-brand-blue-600 to-brand-green-500 p-8 text-center shadow-2xl shadow-brand-blue-950/30 sm:p-12">
            <ShieldCheck className="mx-auto h-10 w-10 text-white" />
            <h2 className="mt-5 text-3xl font-black sm:text-4xl">
              Ready to bring KuikChat into your workflow?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/85">
              Start for free today; follow our progress as we launch our desktop apps, mobile versions, and expanded AI tools.
            </p>
            <Button asChild className="mt-8 rounded-xl bg-white text-slate-950 hover:bg-white/90">
              <Link href="/signup">Try For Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
