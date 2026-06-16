import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface InfoSection {
  title: string
  body: ReactNode
}

interface InfoPageProps {
  eyebrow: string
  title: string
  description: string
  updated?: string
  sections: InfoSection[]
}

export function InfoPage({
  eyebrow,
  title,
  description,
  updated = 'Last updated June 3, 2026',
  sections,
}: InfoPageProps) {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue-500">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {description}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {updated.replace('Last updated ', '')}</p>
      </div>

      <div className="mt-12 grid gap-5">
        {sections.map((section) => (
          <Card key={section.title} className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
            <div className="mt-4 space-y-4 leading-7 text-muted-foreground">
              {section.body}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
