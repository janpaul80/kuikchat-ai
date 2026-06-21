'use client'

import { useEffect, useState } from 'react'
import { Check, Sun, Moon, Smartphone, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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

interface AppearanceFormProps {
  initialSettings: {
    theme: string
    accent_color: string
    font_size: string
    bubble_style: string
  }
}

export function AppearanceForm({ initialSettings }: AppearanceFormProps) {
  const supabase = createClient()
  const [theme, setTheme] = useState(initialSettings.theme)
  const [accent, setAccent] = useState(initialSettings.accent_color)
  const [fontSize, setFontSize] = useState(initialSettings.font_size)
  const [bubbleStyle, setBubbleStyle] = useState(initialSettings.bubble_style)
  const [saving, setSaving] = useState(false)

  // Apply theme to document element
  const applyTheme = (t: string) => {
    setTheme(t)
    localStorage.setItem('kc-theme', t)
    const root = document.documentElement
    root.classList.remove('dark', 'amoled')
    if (t === 'dark') {
      root.classList.add('dark')
    } else if (t === 'amoled') {
      root.classList.add('dark', 'amoled')
    } else if (t === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('appearance_settings')
        .upsert({
          user_id: user.id,
          theme,
          accent_color: accent,
          font_size: fontSize,
          bubble_style: bubbleStyle,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      toast.success('Appearance settings saved successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save appearance settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme Picker */}
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
                    ? 'border-brand-blue-500 bg-brand-blue-900/10'
                    : 'border-border hover:bg-card/50'
                )}
              >
                <Icon className="h-6 w-6 text-foreground" />
                <span className="text-sm font-medium text-foreground">{t.label}</span>
                {active && <Check className="h-4 w-4 text-brand-blue-500 mt-1" />}
              </button>
            )
          })}
        </div>
      </SettingsSection>

      {/* Accent Color Picker */}
      <SettingsSection title="Accent color">
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccent(a.id)}
              className={cn(
                'group relative h-12 w-12 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
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

      {/* Font Size & Chat Customization */}
      <SettingsSection title="Text & Styling">
        <SettingsRow label="Font size" description={`Currently: ${fontSize}`}>
          <div className="flex gap-1">
            {['small', 'medium', 'large', 'xlarge'].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={fontSize === s ? 'default' : 'outline'}
                onClick={() => setFontSize(s)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </SettingsRow>

        <SettingsRow label="Message Bubble Style" description={`Currently: ${bubbleStyle}`}>
          <div className="flex gap-1">
            {['rounded', 'sharp'].map((style) => (
              <Button
                key={style}
                size="sm"
                variant={bubbleStyle === style ? 'default' : 'outline'}
                onClick={() => setBubbleStyle(style)}
                className="capitalize"
              >
                {style}
              </Button>
            ))}
          </div>
        </SettingsRow>
      </SettingsSection>

      <div className="flex justify-end gap-3">
        <Button variant="gradient" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save settings
        </Button>
      </div>
    </div>
  )
}
