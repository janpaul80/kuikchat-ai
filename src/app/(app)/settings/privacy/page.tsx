import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import {
  SettingsContainer,
  SettingsHeader,
} from '@/components/settings/SettingsSection'
import { PrivacyForm } from '@/components/settings/PrivacyForm'

export default async function PrivacySettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, last_seen_visibility, profile_photo_visibility, bio_visibility, read_receipts_enabled, typing_indicator_enabled, ghost_mode')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching privacy settings:', error)
    return (
      <SettingsContainer>
        <SettingsHeader title="Privacy" description="Control who can see what" />
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-base font-bold">Failed to load privacy settings</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            We encountered a database error or your profile is still initializing. Please refresh the page or contact support.
          </p>
        </div>
      </SettingsContainer>
    )
  }

  const initialPrivacy = {
    id: profile.id,
    last_seen_visibility: (profile.last_seen_visibility || 'contacts') as 'everyone' | 'contacts' | 'nobody',
    profile_photo_visibility: (profile.profile_photo_visibility || 'everyone') as 'everyone' | 'contacts' | 'nobody',
    bio_visibility: (profile.bio_visibility || 'contacts') as 'everyone' | 'contacts' | 'nobody',
    read_receipts_enabled: profile.read_receipts_enabled ?? true,
    typing_indicator_enabled: profile.typing_indicator_enabled ?? true,
    ghost_mode: profile.ghost_mode ?? false,
  }

  return (
    <SettingsContainer>
      <SettingsHeader title="Privacy" description="Control who can see what" />
      <PrivacyForm initialPrivacy={initialPrivacy} />
    </SettingsContainer>
  )
}
