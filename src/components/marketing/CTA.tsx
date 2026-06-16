'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoHero } from '@/components/brand/Logo'

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-white sm:p-16"
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative">
            <div className="mb-6 flex justify-center">
              <LogoHero size={80} />
            </div>

            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
              Ready to experience KuikChat?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Start now with secure messaging, integrated Hermes AI, and zero phone number requirement. Your communication ecosystem starts here.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="xl"
                className="bg-white text-brand-blue-600 hover:bg-white/90"
                asChild
              >
                <Link href="/signup">
                  Create Your Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
