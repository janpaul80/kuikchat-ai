import { type LucideIcon, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PagePlaceholderProps {
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  comingSoon?: boolean
}

export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  features,
  comingSoon = true,
}: PagePlaceholderProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-thin">
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {comingSoon && (
                <Badge variant="gradient" className="mt-1">
                  Coming in Phase 2
                </Badge>
              )}
            </div>
          </div>

          <p className="mb-6 text-muted-foreground">{description}</p>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            What you'll get
          </h3>
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green-500/10">
                  <Check className="h-3.5 w-3.5 text-brand-green-500" />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
