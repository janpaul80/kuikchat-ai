import type { Metadata } from 'next'
import BubbleHero from '@/components/hero/BubbleHero'
import { heroCopy } from '@/lib/heroCopy'
import { Pricing } from '@/components/marketing/Pricing'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for KuikChat. Start free, upgrade when you need more.',
}

export default function PricingPage() {
  return (
    <>
      <BubbleHero {...heroCopy.pricing} />
      <Pricing />
    </>
  )
}
