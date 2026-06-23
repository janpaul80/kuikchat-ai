import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import {
  SettingsContainer,
  SettingsHeader,
} from '@/components/settings/SettingsSection'
import { NotificationsForm } from '@/components/settings/NotificationsForm'
export const dynamic = 'force-dynamic'

export default async function NotificationsSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifs, error } = await supabase
    .from('notification_settings')
    .select('user_id, message_notifications, group_notifications, call_notifications, status_notifications, channel_notifications, email_notifications, message_preview, message_sound, call_ringtone, vibrate, do_not_disturb')
    .eq('user_id', user.id)
    .single()

  if (error || !notifs) {
    console.error('Error fetching notification settings:', error)
    return (
      <SettingsContainer>
        <SettingsHeader title="Notifications" description="Decide what reaches you and when" />
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-base font-bold">Failed to load notification settings</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            We encountered a database error or your settings are still initializing. Please refresh the page or contact support.
          </p>
        </div>
      </SettingsContainer>
    )
  }

  const initialNotifications = {
    user_id: notifs.user_id,
    message_notifications: notifs.message_notifications ?? true,
    group_notifications: notifs.group_notifications ?? true,
    call_notifications: notifs.call_notifications ?? true,
    status_notifications: notifs.status_notifications ?? true,
    channel_notifications: notifs.channel_notifications ?? true,
    email_notifications: notifs.email_notifications ?? false,
    message_preview: notifs.message_preview ?? true,
    message_sound: notifs.message_sound || 'default',
    call_ringtone: notifs.call_ringtone || 'default',
    vibrate: notifs.vibrate ?? true,
    do_not_disturb: notifs.do_not_disturb ?? false,
  }

  return (
    <SettingsContainer>
      <SettingsHeader title="Notifications" description="Decide what reaches you and when" />
      <NotificationsForm initialNotifications={initialNotifications} />
    </SettingsContainer>
  )
}
