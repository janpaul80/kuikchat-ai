import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
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
    return (
      <SettingsContainer>
        <SettingsHeader title="Security" description="Signal-level encryption meets user-friendly controls" />
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-base font-bold">Failed to load security settings</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            We encountered a database error or your profile is still initializing. Please refresh the page or contact support.
          </p>
        </div>
      </SettingsContainer>
    )
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
