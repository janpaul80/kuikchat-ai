import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import {
  SettingsContainer,
  SettingsHeader,
} from '@/components/settings/SettingsSection'
import { ProfileForm } from '@/components/settings/ProfileForm'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Query database profiles table as primary source of truth
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching user profile:', error)
    return (
      <SettingsContainer>
        <SettingsHeader title="Profile" description="How others see you on KuikChat" />
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-base font-bold">Failed to load profile data</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            We encountered a database error or your profile is still initializing. Please refresh the page or contact support.
          </p>
        </div>
      </SettingsContainer>
    )
  }

  const initialProfile = {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name || user.email?.split('@')[0] || 'User',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url,
    email: user.email || null,
  }

  return (
    <SettingsContainer>
      <SettingsHeader title="Profile" description="How others see you on KuikChat" />
      <ProfileForm initialProfile={initialProfile} />
    </SettingsContainer>
  )
}
