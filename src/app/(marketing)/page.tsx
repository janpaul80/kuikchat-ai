import { Hero } from '@/components/marketing/Hero'
import { ProductPromise } from '@/components/marketing/ProductPromise'
import { ProductWorkflow } from '@/components/marketing/ProductWorkflow'
import { LandingHighlights } from '@/components/marketing/LandingHighlights'
import { CTA } from '@/components/marketing/CTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductPromise />
      <ProductWorkflow />
      <LandingHighlights />
      <CTA />
    </>
  )
}
