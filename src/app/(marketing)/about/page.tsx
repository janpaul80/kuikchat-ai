import type { Metadata } from 'next'
import { LogoHero } from '@/components/brand/Logo'
import { CTA } from '@/components/marketing/CTA'

export const metadata: Metadata = {
  title: 'About',
  description: "Learn about KuikChat's mission to build the last messenger you'll ever need.",
}

export default function AboutPage() {
  return (
    <>
      <section className="container mx-auto px-4 pt-20 pb-12 text-center">
        <div className="mb-8 flex justify-center">
          <LogoHero size={100} />
        </div>
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          Built for a <span className="text-brand-gradient">better way</span> to communicate.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          We believe messaging should be private, powerful, and beautiful. Not bloated.
          Not invasive. Not stuck in 2010.
        </p>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-lg dark:prose-invert mx-auto">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground">
            KuikChat exists because the world's messaging apps have settled. WhatsApp
            harvests your data. Telegram doesn't encrypt by default. Signal lacks features.
            Discord is built for gamers. Slack costs a fortune per seat.
          </p>
          <p className="text-muted-foreground">
            We're building the messenger that combines the best of all worlds — Signal's
            security, Telegram's flexibility, WhatsApp's simplicity, Discord's communities,
            and Slack's professional features — wrapped in a beautiful, modern interface
            and supercharged with our AI agent, Hermes.
          </p>

          <h2 className="mt-12 text-3xl font-bold">Our Values</h2>
          <ul className="space-y-4 text-muted-foreground">
            <li>
              <strong className="text-foreground">Privacy is non-negotiable.</strong>{' '}
              End-to-end encryption is always on. We can't read your messages. Ever.
            </li>
            <li>
              <strong className="text-foreground">No phone numbers.</strong> Your identity
              is yours. Sign up with email and pick your own @username.
            </li>
            <li>
              <strong className="text-foreground">No ads. No data selling.</strong> We make
              money from premium features, not from you.
            </li>
            <li>
              <strong className="text-foreground">Build for the long term.</strong> Open
              standards, transparent practices, and a sustainable business model.
            </li>
          </ul>
        </div>
      </section>

      <CTA />
    </>
  )
}
