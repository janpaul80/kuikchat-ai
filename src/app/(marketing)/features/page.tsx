import type { Metadata } from 'next'
import BubbleHero from '@/components/hero/BubbleHero'
import { heroCopy } from '@/lib/heroCopy'
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid'
import { HermesShowcase } from '@/components/marketing/HermesShowcase'
import { Comparison } from '@/components/marketing/Comparison'
import { CTA } from '@/components/marketing/CTA'

export const metadata: Metadata = {
  title: 'Features',
  description: '130+ features across messaging, calls, AI, communities, and more.',
}

export default function FeaturesPage() {
  return (
    <>
      <BubbleHero {...heroCopy.features} />
      <FeaturesGrid />
      <HermesShowcase />
      <Comparison />
      <CTA />
    </>
  )
}
