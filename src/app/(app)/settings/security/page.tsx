import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  SettingsContainer,
  SettingsHeader,
} from '@/components/settings/SettingsSection'
import { SecurityForm } from '@/components/settings/SecurityForm'

export default async function SecuritySettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, two_factor_enabled, app_lock_enabled, screenshot_block, totp_secret, backup_codes')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching security settings:', error)
    redirect('/chats')
  }

  const initialSecurity = {
    id: profile.id,
    two_factor_enabled: profile.two_factor_enabled ?? false,
    app_lock_enabled: profile.app_lock_enabled ?? false,
    screenshot_block: profile.screenshot_block ?? false,
    totp_secret: profile.totp_secret,
    backup_codes: profile.backup_codes,
  }

  return (
    <SettingsContainer>
      <SettingsHeader title="Security" description="Signal-level encryption meets user-friendly controls" />
      <SecurityForm initialSecurity={initialSecurity} />
    </SettingsContainer>
  )
}
