'use client'

import { useState, useRef, useEffect } from 'react'
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

const RINGTONES = {
  default: { name: 'Message Tone', path: '/ringtones/message-for-you.mp3' },
  'pop-blast': { name: 'Pop Blast', path: '/ringtones/pop-blast.mp3' },
  'pop-fireworks': { name: 'Pop Fireworks', path: '/ringtones/pop-fireworks.mp3' },
  'rock-power': { name: 'Rock Power', path: '/ringtones/rock-power.mp3' },
  'anonymous-call': { name: 'Digital Call', path: '/ringtones/anonymous-call.mp3' },
  malibu: { name: 'Malibu Ambient', path: '/ringtones/malibu.mp3' },
  'k-pop': { name: 'K-Pop', path: '/ringtones/k-pop.mp3' },
} as const

const getNormalizedRingtone = (val: string) => {
  if (val === 'classic') return 'pop-blast'
  if (val === 'digital') return 'anonymous-call'
  if (val === 'ambient') return 'malibu'
  if (!val || !RINGTONES[val as keyof typeof RINGTONES]) return 'default'
  return val
}

export function NotificationsForm({ initialNotifications }: NotificationsFormProps) {
  const supabase = createClient()
  const [msgNotifs, setMsgNotifs] = useState(initialNotifications.message_notifications)
  const [msgPreview, setMsgPreview] = useState(initialNotifications.message_preview)
  const [msgSound, setMsgSound] = useState(initialNotifications.message_sound)
  const [vibrate, setVibrate] = useState(initialNotifications.vibrate)
  const [groupNotifs, setGroupNotifs] = useState(initialNotifications.group_notifications)
  const [callNotifs, setCallNotifs] = useState(initialNotifications.call_notifications)
  const [callRingtone, setCallRingtone] = useState(() => getNormalizedRingtone(initialNotifications.call_ringtone))
  const [dnd, setDnd] = useState(initialNotifications.do_not_disturb)
  const [emailNotifs, setEmailNotifs] = useState(initialNotifications.email_notifications)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  const playRingtonePreview = (toneKey: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    const tone = RINGTONES[toneKey as keyof typeof RINGTONES] || RINGTONES.default
    const audio = new Audio(tone.path)
    audio.volume = 0.5
    audioRef.current = audio
    audio.play().catch(err => console.error('Ringtone preview playback failed:', err))
  }

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
              playRingtonePreview(val)
              toast.success('Ringtone updated')
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RINGTONES).map(([key, item]) => (
                <SelectItem key={key} value={key}>
                  {item.name}
                </SelectItem>
              ))}
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
