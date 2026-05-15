'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoHero } from '@/components/brand/Logo'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="blob bg-brand-blue-500"
          style={{ width: 500, height: 500, top: '-10%', left: '-10%' }}
        />
        <div
          className="blob bg-brand-green-400"
          style={{
            width: 500,
            height: 500,
            top: '20%',
            right: '-10%',
            animationDelay: '5s',
          }}
        />
        <div
          className="blob bg-brand-teal-500"
          style={{
            width: 400,
            height: 400,
            bottom: '-10%',
            left: '30%',
            animationDelay: '10s',
          }}
        />
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <LogoHero size={120} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Badge variant="gradient" className="mb-6 px-4 py-1.5 text-sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Powered by Hermes AI
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl"
        >
          The last messenger you'll{' '}
          <span className="text-brand-gradient">ever need</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
        >
          KuikChat unifies messaging, voice, video, communities, and AI into one
          sleek, secure app. No phone number required. End-to-end encrypted by
          default.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button size="xl" variant="gradient" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/features">Explore Features</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-green-500" />
            End-to-end encrypted
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-blue-500" />
            Lightning fast
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-teal-500" />
            AI-powered
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-green-500 animate-pulse" />
            No phone number needed
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4"
        >
          {[
            { value: '130+', label: 'Features' },
            { value: '1,024', label: 'Group size' },
            { value: '42', label: 'Call participants' },
            { value: '50GB', label: 'File transfer' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-brand-gradient sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
