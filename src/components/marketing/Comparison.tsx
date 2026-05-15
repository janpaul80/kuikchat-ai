'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Card } from '@/components/ui/card'

const COMPARISONS = [
  { feature: 'No phone number required', kuik: true, whatsapp: false, telegram: false, signal: false, discord: true },
  { feature: 'End-to-end encrypted by default', kuik: true, whatsapp: true, telegram: false, signal: true, discord: false },
  { feature: 'Built-in AI assistant', kuik: true, whatsapp: 'limited', telegram: false, signal: false, discord: false },
  { feature: 'Group size up to 1,024', kuik: true, whatsapp: 'limited', telegram: true, signal: false, discord: true },
  { feature: 'Channels & broadcast', kuik: true, whatsapp: false, telegram: true, signal: false, discord: false },
  { feature: 'Professional mode', kuik: true, whatsapp: 'limited', telegram: false, signal: false, discord: false },
  { feature: 'Custom AI stickers', kuik: true, whatsapp: false, telegram: false, signal: false, discord: false },
  { feature: 'Voice transcription', kuik: true, whatsapp: 'limited', telegram: false, signal: false, discord: false },
  { feature: 'Built-in file transfer (50GB)', kuik: true, whatsapp: false, telegram: false, signal: false, discord: false },
  { feature: 'Communities (super groups)', kuik: true, whatsapp: true, telegram: false, signal: false, discord: true },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-brand-green-500" />
  if (value === false) return <X className="mx-auto h-5 w-5 text-muted-foreground/40" />
  return <span className="text-xs text-muted-foreground">Limited</span>
}

export function Comparison() {
  return (
    <section className="bg-secondary/30 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            How KuikChat <span className="text-brand-gradient">stacks up</span>.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Built on the lessons from every other messenger. Without their compromises.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-16 max-w-5xl overflow-x-auto"
        >
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-4 text-left text-sm font-semibold">Feature</th>
                  <th className="p-4 text-center text-sm font-bold text-brand-gradient">
                    KuikChat
                  </th>
                  <th className="p-4 text-center text-sm font-medium">WhatsApp</th>
                  <th className="p-4 text-center text-sm font-medium">Telegram</th>
                  <th className="p-4 text-center text-sm font-medium">Signal</th>
                  <th className="p-4 text-center text-sm font-medium">Discord</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-border/50 ${
                      i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'
                    }`}
                  >
                    <td className="p-4 text-sm font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      <Cell value={row.kuik} />
                    </td>
                    <td className="p-4 text-center">
                      <Cell value={row.whatsapp} />
                    </td>
                    <td className="p-4 text-center">
                      <Cell value={row.telegram} />
                    </td>
                    <td className="p-4 text-center">
                      <Cell value={row.signal} />
                    </td>
                    <td className="p-4 text-center">
                      <Cell value={row.discord} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
