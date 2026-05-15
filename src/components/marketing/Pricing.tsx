'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRICING_TIERS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing.{' '}
            <span className="text-brand-gradient">Powerful features.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-7xl gap-6 lg:grid-cols-4">
          {PRICING_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Card
                className={cn(
                  'relative flex h-full flex-col p-6 transition-all hover:shadow-xl',
                  tier.highlight &&
                    'border-2 border-brand-blue-500 shadow-xl shadow-brand-blue-500/20 scale-[1.02]'
                )}
              >
                {tier.highlight && (
                  <Badge variant="gradient" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.priceLabel}</span>
                    <span className="text-sm text-muted-foreground">/{tier.period}</span>
                  </div>
                </div>

                <Button
                  variant={tier.highlight ? 'gradient' : 'outline'}
                  className="mb-6 w-full"
                  asChild
                >
                  <Link href="/signup">{tier.cta}</Link>
                </Button>

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include end-to-end encryption, no ads, and no data selling. Ever.
        </p>
      </div>
    </section>
  )
}
