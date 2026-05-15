import { Hero } from '@/components/marketing/Hero'
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid'
import { HermesShowcase } from '@/components/marketing/HermesShowcase'
import { Comparison } from '@/components/marketing/Comparison'
import { Pricing } from '@/components/marketing/Pricing'
import { CTA } from '@/components/marketing/CTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <HermesShowcase />
      <Comparison />
      <Pricing />
      <CTA />
    </>
  )
}
