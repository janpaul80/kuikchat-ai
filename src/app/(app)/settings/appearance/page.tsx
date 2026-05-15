'use client'

import { useEffect, useState } from 'react'
import { Check, Sun, Moon, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { Button } from '@/components/ui/button'

const THEMES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'amoled', label: 'AMOLED', icon: Moon },
  { id: 'system', label: 'System', icon: Smartphone },
] as const

const ACCENTS = [
  { id: 'gradient', label: 'Brand', class: 'bg-brand-gradient' },
  { id: 'blue', label: 'Blue', class: 'bg-brand-blue-500' },
  { id: 'green', label: 'Green', class: 'bg-brand-green-500' },
  { id: 'teal', label: 'Teal', class: 'bg-brand-teal-500' },
  { id: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { id: 'pink', label: 'Pink', class: 'bg-pink-500' },
]

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<string>('system')
  const [accent, setAccent] = useState<string>('gradient')
  const [fontSize, setFontSize] = useState<string>('medium')

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('kc-theme')) || 'system'
    setTheme(saved)
  }, [])

  function applyTheme(t: string) {
    setTheme(t)
    if (typeof window === 'undefined') return
    localStorage.setItem('kc-theme', t)
    const root = document.documentElement
    root.classList.remove('dark', 'amoled')
    if (t === 'dark') root.classList.add('dark')
    else if (t === 'amoled') root.classList.add('dark', 'amoled')
    else if (t === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    }
  }

  return (
    <SettingsContainer>
      <SettingsHeader title="Appearance" description="Make KuikChat your own" />

      <SettingsSection title="Theme">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map((t) => {
            const Icon = t.icon
            const active = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => applyTheme(t.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
                  active
                    ? 'border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/30'
                    : 'border-border hover:bg-accent'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{t.label}</span>
                {active && <Check className="h-4 w-4 text-brand-blue-500" />}
              </button>
            )
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="Accent color">
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccent(a.id)}
              className={cn(
                'group relative h-12 w-12 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all',
                a.class,
                accent === a.id ? 'ring-foreground' : 'ring-transparent'
              )}
              title={a.label}
            >
              {accent === a.id && (
                <Check className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Text">
        <SettingsRow label="Font size" description={`Currently: ${fontSize}`}>
          <div className="flex gap-1">
            {(['small', 'medium', 'large'] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={fontSize === s ? 'default' : 'outline'}
                onClick={() => setFontSize(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Chat wallpaper">
        <SettingsRow label="Default wallpaper" description="Brand gradient">
          <Button variant="outline" size="sm">Change</Button>
        </SettingsRow>
        <SettingsRow label="Per-chat wallpapers" description="Set unique wallpaper per chat">
          <Button variant="outline" size="sm">Manage</Button>
        </SettingsRow>
      </SettingsSection>
    </SettingsContainer>
  )
}
