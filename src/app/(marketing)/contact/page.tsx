import type { Metadata } from 'next'
import BubbleHero from '@/components/hero/BubbleHero'
import { heroCopy } from '@/lib/heroCopy'
import { Mail, MessageSquare, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact KuikChat for support, security, and product questions.',
}

const CONTACT_OPTIONS = [
  {
    title: 'General support',
    description: 'Account access, launch questions, billing readiness, or product feedback.',
    detail: 'support@kuikchat.com',
    icon: MessageSquare,
  },
  {
    title: 'Security',
    description: 'Report suspected vulnerabilities, abuse, or sensitive security concerns.',
    detail: 'security@kuikchat.com',
    icon: Shield,
  },
  {
    title: 'Business',
    description: 'Partnerships, professional messaging, FileNinja, Rev-Pro, or roadmap questions.',
    detail: 'hello@kuikchat.com',
    icon: Mail,
  },
]

export default function ContactPage() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <BubbleHero {...heroCopy.contact} className="min-h-[60vh] rounded-3xl" />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {CONTACT_OPTIONS.map((option) => {
          const Icon = option.icon
          return (
            <Card key={option.title} className="p-6">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">{option.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {option.description}
              </p>
              <p className="mt-5 font-semibold text-brand-blue-500">{option.detail}</p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
