'use client'

import { useState } from 'react'
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

interface NotificationsFormProps {
  initialNotifications: {
    user_id: string
    message_notifications: boolean
    group_notifications: boolean
    call_notifications: boolean
    status_notifications: boolean
    channel_notifications: boolean
    email_notifications: boolean
    message_preview: boolean
    message_sound: string
    call_ringtone: string
    vibrate: boolean
    do_not_disturb: boolean
  }
}

export function NotificationsForm({ initialNotifications }: NotificationsFormProps) {
  const supabase = createClient()
  const [msgNotifs, setMsgNotifs] = useState(initialNotifications.message_notifications)
  const [msgPreview, setMsgPreview] = useState(initialNotifications.message_preview)
  const [msgSound, setMsgSound] = useState(initialNotifications.message_sound)
  const [vibrate, setVibrate] = useState(initialNotifications.vibrate)
  const [groupNotifs, setGroupNotifs] = useState(initialNotifications.group_notifications)
  const [callNotifs, setCallNotifs] = useState(initialNotifications.call_notifications)
  const [callRingtone, setCallRingtone] = useState(initialNotifications.call_ringtone)
  const [dnd, setDnd] = useState(initialNotifications.do_not_disturb)
  const [emailNotifs, setEmailNotifs] = useState(initialNotifications.email_notifications)

  const handleUpdate = async (fields: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update(fields)
        .eq('user_id', initialNotifications.user_id)

      if (error) throw error
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update notification settings')
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection title="Messages">
        <SettingsRow
          label="New message notifications"
          description="Show notifications for new messages"
        >
          <Switch
            checked={msgNotifs}
            onCheckedChange={async (checked: boolean) => {
              setMsgNotifs(checked)
              await handleUpdate({ message_notifications: checked })
              toast.success(`Message notifications turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>

        <SettingsRow
          label="Message preview"
          description="Show message text in notifications"
        >
          <Switch
            checked={msgPreview}
            onCheckedChange={async (checked: boolean) => {
              setMsgPreview(checked)
              await handleUpdate({ message_preview: checked })
              toast.success(`Message preview turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>

        <SettingsRow label="Notification sound">
          <Select
            value={msgSound}
            onValueChange={async (val: string) => {
              setMsgSound(val)
              await handleUpdate({ message_sound: val })
              toast.success('Notification sound updated')
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Tone</SelectItem>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="chime">Chime</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow
          label="Vibration"
          description="Enable vibration on notification"
        >
          <Switch
            checked={vibrate}
            onCheckedChange={async (checked: boolean) => {
              setVibrate(checked)
              await handleUpdate({ vibrate: checked })
              toast.success(`Vibration turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Groups">
        <SettingsRow
          label="Group notifications"
          description="Show notifications for group messages"
        >
          <Switch
            checked={groupNotifs}
            onCheckedChange={async (checked: boolean) => {
              setGroupNotifs(checked)
              await handleUpdate({ group_notifications: checked })
              toast.success(`Group notifications turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Calls">
        <SettingsRow
          label="Call notifications"
          description="Incoming voice and video calls"
        >
          <Switch
            checked={callNotifs}
            onCheckedChange={async (checked: boolean) => {
              setCallNotifs(checked)
              await handleUpdate({ call_notifications: checked })
              toast.success(`Call notifications turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>

        <SettingsRow label="Ringtone">
          <Select
            value={callRingtone}
            onValueChange={async (val: string) => {
              setCallRingtone(val)
              await handleUpdate({ call_ringtone: val })
              toast.success('Ringtone updated')
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Ringtone</SelectItem>
              <SelectItem value="classic">Classic Bell</SelectItem>
              <SelectItem value="digital">Digital Call</SelectItem>
              <SelectItem value="ambient">Ambient Loop</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Do Not Disturb">
        <SettingsRow
          label="Quiet hours (DND)"
          description="Mute all notifications during quiet hours"
        >
          <Switch
            checked={dnd}
            onCheckedChange={async (checked: boolean) => {
              setDnd(checked)
              await handleUpdate({ do_not_disturb: checked })
              toast.success(`Do Not Disturb turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Email notifications">
        <SettingsRow
          label="Security & Product alerts"
          description="Login alerts, key changes, and announcements"
        >
          <Switch
            checked={emailNotifs}
            onCheckedChange={async (checked: boolean) => {
              setEmailNotifs(checked)
              await handleUpdate({ email_notifications: checked })
              toast.success(`Email alerts turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  )
}
