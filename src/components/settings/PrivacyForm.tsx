'use client'

import { useState } from 'react'
import { Check, ShieldAlert, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PrivacyFormProps {
  initialPrivacy: {
    id: string
    last_seen_visibility: 'everyone' | 'contacts' | 'nobody'
    profile_photo_visibility: 'everyone' | 'contacts' | 'nobody'
    bio_visibility: 'everyone' | 'contacts' | 'nobody'
    read_receipts_enabled: boolean
    typing_indicator_enabled: boolean
    ghost_mode: boolean
  }
}

export function PrivacyForm({ initialPrivacy }: PrivacyFormProps) {
  const supabase = createClient()
  const [lastSeen, setLastSeen] = useState(initialPrivacy.last_seen_visibility)
  const [profilePhoto, setProfilePhoto] = useState(initialPrivacy.profile_photo_visibility)
  const [bio, setBio] = useState(initialPrivacy.bio_visibility)
  const [readReceipts, setReadReceipts] = useState(initialPrivacy.read_receipts_enabled)
  const [typingIndicator, setTypingIndicator] = useState(initialPrivacy.typing_indicator_enabled)
  const [ghostMode, setGhostMode] = useState(initialPrivacy.ghost_mode)
  const [saving, setSaving] = useState(false)

  const handleUpdate = async (fields: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', initialPrivacy.id)

      if (error) throw error
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update privacy settings')
    }
  }

  const handleGhostModeToggle = async (checked: boolean) => {
    setGhostMode(checked)
    if (checked) {
      // Ghost mode forces off read receipts, typing indicator, last seen visibility
      setReadReceipts(false)
      setTypingIndicator(false)
      setLastSeen('nobody')
      await handleUpdate({
        ghost_mode: true,
        read_receipts_enabled: false,
        typing_indicator_enabled: false,
        last_seen_visibility: 'nobody',
      })
      toast.info('Ghost Mode enabled: invisible mode active')
    } else {
      await handleUpdate({ ghost_mode: false })
      toast.info('Ghost Mode disabled')
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection title="Who can see..." description="Control who can see your personal info">
        <SettingsRow label="Last seen & online">
          <Select
            value={lastSeen}
            onValueChange={async (val: 'everyone' | 'contacts' | 'nobody') => {
              if (ghostMode && val !== 'nobody') {
                toast.warning('Disable Ghost Mode first to share last seen status')
                return
              }
              setLastSeen(val)
              await handleUpdate({ last_seen_visibility: val })
              toast.success('Last seen preference updated')
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="contacts">Contacts</SelectItem>
              <SelectItem value="nobody">Nobody</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow label="Profile photo">
          <Select
            value={profilePhoto}
            onValueChange={async (val: 'everyone' | 'contacts' | 'nobody') => {
              setProfilePhoto(val)
              await handleUpdate({ profile_photo_visibility: val })
              toast.success('Profile photo preference updated')
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="contacts">Contacts</SelectItem>
              <SelectItem value="nobody">Nobody</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow label="Bio">
          <Select
            value={bio}
            onValueChange={async (val: 'everyone' | 'contacts' | 'nobody') => {
              setBio(val)
              await handleUpdate({ bio_visibility: val })
              toast.success('Bio preference updated')
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="contacts">Contacts</SelectItem>
              <SelectItem value="nobody">Nobody</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Chat indicators" description="Manage receipt ticks and typing indicators">
        <SettingsRow
          label="Read receipts"
          description="If turned off, you won't send or receive read receipts (except in group chats)"
        >
          <Switch
            checked={readReceipts}
            disabled={ghostMode}
            onCheckedChange={async (checked: boolean) => {
              setReadReceipts(checked)
              await handleUpdate({ read_receipts_enabled: checked })
              toast.success(`Read receipts turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>

        <SettingsRow
          label="Typing indicator"
          description="If turned off, others won't see when you are typing in chats"
        >
          <Switch
            checked={typingIndicator}
            disabled={ghostMode}
            onCheckedChange={async (checked: boolean) => {
              setTypingIndicator(checked)
              await handleUpdate({ typing_indicator_enabled: checked })
              toast.success(`Typing indicator turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Ghost mode" description="Go completely invisible across the platform">
        <SettingsRow
          label="Enable Ghost Mode"
          description="Disables online status, last seen, and read receipts automatically"
        >
          <Switch
            checked={ghostMode}
            onCheckedChange={handleGhostModeToggle}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Blocked contacts">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Blocked users</p>
            <p className="text-xs text-muted-foreground">Manage accounts you have blocked</p>
          </div>
          <Button variant="outline" size="sm">Manage list</Button>
        </div>
      </SettingsSection>
    </div>
  )
}
