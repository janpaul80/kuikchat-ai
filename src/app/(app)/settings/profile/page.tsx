import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
    redirect('/chats')
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
