'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#031015]">
      <video
        className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/kuikchat-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(3,16,21,0.88)_0%,rgba(3,16,21,0.70)_36%,rgba(3,16,21,0.30)_72%,rgba(3,16,21,0.55)_100%),linear-gradient(180deg,rgba(3,16,21,0.76)_0%,rgba(3,16,21,0.18)_46%,rgba(3,16,21,0.82)_100%)]" />

      <div className="container mx-auto flex min-h-screen items-center px-4 pb-20 pt-28 sm:pb-24 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <div className="inline-flex rounded-full border border-brand-green-400/25 bg-slate-950/45 px-4 py-2 text-sm font-bold text-brand-green-50 backdrop-blur-xl">
            No phone number required. Secure messaging for real life and real work.
          </div>

          <h1 className="mt-6 text-balance text-5xl font-black leading-none tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
            Modern messaging with privacy, AI, and secure transfer built in.
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-slate-200 drop-shadow-2xl sm:text-xl">
            KuikChat brings personal chats, communities, Hermes AI, professional
            conversations, and FileNinja transfers into one premium communication
            platform.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="xl" variant="gradient" asChild>
              <Link href="/signup">
                Create your account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/20 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15"
              asChild
            >
              <Link href="/features">Explore features</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
