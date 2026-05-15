'use client'

import { motion } from 'framer-motion'
import {
  MessageSquare,
  Video,
  Sparkles,
  Shield,
  Users,
  Radio,
  Briefcase,
  Smile,
  type LucideIcon,
} from 'lucide-react'
import { FEATURE_CATEGORIES } from '@/lib/constants'
import { Card } from '@/components/ui/card'

const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  Video,
  Sparkles,
  Shield,
  Users,
  Radio,
  Briefcase,
  Smile,
}

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need.{' '}
            <span className="text-brand-gradient">In one place.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            130+ features across 8 categories. KuikChat replaces WhatsApp,
            Telegram, Signal, Discord, Slack, and more — all in one beautiful app.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CATEGORIES.map((category, idx) => {
            const Icon = ICON_MAP[category.icon] || MessageSquare
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className="group h-full overflow-hidden p-6 transition-all hover:shadow-xl hover:shadow-brand-blue-500/10 hover:-translate-y-1">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand-blue-500/30 transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{category.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <ul className="space-y-1.5">
                    {category.features.slice(0, 5).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-green-500" />
                        {feature}
                      </li>
                    ))}
                    {category.features.length > 5 && (
                      <li className="pt-1 text-xs font-medium text-brand-blue-500">
                        + {category.features.length - 5} more
                      </li>
                    )}
                  </ul>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
