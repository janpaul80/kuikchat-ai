import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  SettingsContainer,
  SettingsHeader,
} from '@/components/settings/SettingsSection'
import { AppearanceForm } from '@/components/settings/AppearanceForm'

export default async function AppearanceSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: appearance } = await supabase
    .from('appearance_settings')
    .select('theme, accent_color, font_size, bubble_style')
    .eq('user_id', user.id)
    .single()

  const initialSettings = {
    theme: appearance?.theme || 'system',
    accent_color: appearance?.accent_color || 'gradient',
    font_size: appearance?.font_size || 'medium',
    bubble_style: appearance?.bubble_style || 'rounded',
  }

  return (
    <SettingsContainer>
      <SettingsHeader title="Appearance" description="Make KuikChat your own" />
      <AppearanceForm initialSettings={initialSettings} />
    </SettingsContainer>
  )
}
