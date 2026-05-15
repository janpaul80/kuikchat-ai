import type { Metadata } from 'next'
import { Pricing } from '@/components/marketing/Pricing'
import { CTA } from '@/components/marketing/CTA'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for KuikChat. Start free, upgrade when you need more.',
}

export default function PricingPage() {
  return (
    <>
      <div className="container mx-auto px-4 pt-12 pb-4 text-center">
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          Pricing built for <span className="text-brand-gradient">everyone</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          From casual users to enterprises. Find the plan that fits your needs.
        </p>
      </div>
      <Pricing />
      <CTA />
    </>
  )
}
