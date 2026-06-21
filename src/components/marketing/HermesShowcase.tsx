'use client'

import { motion } from 'framer-motion'
import { Sparkles, MessageCircle, Languages, Wand2, FileText, Mic } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const HERMES_ABILITIES = [
  { icon: Languages, title: 'Real-time translation', desc: 'Instantly translate any message into over 100 languages.' },
  { icon: Wand2, title: 'Tone rewriter', desc: 'Adjust your messages to be professional, casual, or friendly.' },
  { icon: FileText, title: 'Chat summaries', desc: "Quickly catch up on missed group conversations in just seconds." },
  { icon: Mic, title: 'Voice transcription', desc: 'Automatically convert your voice messages into text.' },
  { icon: MessageCircle, title: 'Smart replies', desc: 'Get AI-suggested responses that adapt to your conversation.' },
  { icon: Sparkles, title: 'Image generation', desc: 'Create custom images and stickers directly from your text prompts.' },
]

export function HermesShowcase() {
  return (
    <section
      id="hermes"
      className="relative overflow-hidden bg-gradient-to-br from-brand-blue-600 via-brand-teal-500 to-brand-green-500 py-20 md:py-32"
    >
      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 0h1v1H0zM20 20h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center text-white">
          <Badge className="mb-6 border-white/30 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Meet Hermes
          </Badge>
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Your personal AI assistant, right inside every chat.
          </h2>
          <p className="mt-6 text-lg text-white/90">
            Simply tag <code className="rounded bg-white/20 px-2 py-0.5 font-mono">@Hermes</code>{' '}
            in any conversation or start a 1:1 chat. You can translate, summarize, generate images,
            and transcribe voice messages - all without ever leaving KuikChat.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HERMES_ABILITIES.map((ability, idx) => {
            const Icon = ability.icon
            return (
              <motion.div
                key={ability.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className="h-full border-white/20 bg-white/10 p-6 text-white backdrop-blur-md transition-all hover:bg-white/15">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 font-semibold">{ability.title}</h3>
                  <p className="text-sm text-white/80">{ability.desc}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Mock chat preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <Card className="overflow-hidden border-white/20 bg-white/95 p-0 backdrop-blur-xl dark:bg-zinc-900/95">
            <div className="flex items-center gap-3 border-b border-border/40 bg-brand-gradient px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="text-white">
                <div className="text-sm font-semibold">Hermes</div>
                <div className="text-xs text-white/80">Online • Casual mode</div>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-blue-500 px-4 py-2 text-sm text-white">
                  Translate "Bonjour, comment allez-vous?" to English
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2 text-sm">
                  "Hello, how are you?" 👋
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-blue-500 px-4 py-2 text-sm text-white">
                  Summarize the last 50 messages in our team chat
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2 text-sm">
                  📋 <strong>Summary:</strong> Sarah shared the Q4 design mockups, the team
                  approved the new color palette, and the launch is scheduled for next Friday.
                  Action items: Review designs by Wed, sign off by Thu.
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
