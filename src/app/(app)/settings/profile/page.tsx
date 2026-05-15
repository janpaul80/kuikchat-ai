import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
} from '@/components/settings/SettingsSection'
import { getInitials } from '@/lib/utils'
import { Camera, QrCode } from 'lucide-react'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const meta = user.user_metadata || {}
  const displayName = meta.display_name || meta.full_name || user.email?.split('@')[0] || 'User'
  const username = meta.username || ''

  return (
    <SettingsContainer>
      <SettingsHeader title="Profile" description="How others see you on KuikChat" />

      <SettingsSection title="Profile photo">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={meta.avatar_url} alt={displayName} />
              <AvatarFallback className="text-2xl">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg ring-2 ring-card">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <Button variant="outline">Upload photo</Button>
            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG or GIF. Max 5MB. Square images work best.
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Personal info">
        <div className="space-y-2">
          <Label>Display name</Label>
          <Input defaultValue={displayName} placeholder="Your full name" />
          <p className="text-xs text-muted-foreground">
            This is how your name appears in chats and groups.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Username</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <Input
              defaultValue={username}
              placeholder="yourname"
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            People can find and add you using @{username || 'yourname'}.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Input defaultValue={meta.bio || ''} placeholder="Tell people about yourself" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email || ''} disabled />
        </div>
      </SettingsSection>

      <SettingsSection title="Your QR code">
        <div className="flex items-center gap-4">
          <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary">
            <QrCode className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm">
              Share your QR code so others can add you instantly.
            </p>
            <Button variant="outline" className="mt-3" size="sm">
              Download QR
            </Button>
          </div>
        </div>
      </SettingsSection>

      <div className="flex justify-end gap-3">
        <Button variant="ghost">Cancel</Button>
        <Button variant="gradient">Save changes</Button>
      </div>
    </SettingsContainer>
  )
}
