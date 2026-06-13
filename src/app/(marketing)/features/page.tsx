import type { Metadata } from 'next'
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
      <div className="container mx-auto px-4 pt-12 pb-4 text-center">
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          Launch-ready now.{' '}
          <span className="text-brand-gradient">Built to grow.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          KuikChat starts with secure messaging, Hermes AI, and FileNinja-ready
          transfer workflows, then expands into calls, communities, professional
          messaging, Rev-Pro, and VideoAgent over staged releases.
        </p>
      </div>
      <FeaturesGrid />
      <HermesShowcase />
      <Comparison />
      <CTA />
    </>
  )
}
