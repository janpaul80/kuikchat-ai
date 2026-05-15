import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

interface SettingsRowProps {
  label: string
  description?: string
  children?: ReactNode
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}

export function SettingsContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl space-y-6 p-6">{children}</div>
}

export function SettingsHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="hidden md:block">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
  )
}
