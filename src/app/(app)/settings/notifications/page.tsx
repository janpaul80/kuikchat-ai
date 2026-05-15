import { Button } from '@/components/ui/button'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'

export default function NotificationsSettingsPage() {
  return (
    <SettingsContainer>
      <SettingsHeader title="Notifications" description="Decide what reaches you and when" />

      <SettingsSection title="Messages">
        <SettingsRow label="New message notifications" description="Show notifications for new messages">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
        <SettingsRow label="Message preview" description="Show message text in notifications">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
        <SettingsRow label="Notification sound" description="Default tone">
          <Button variant="outline" size="sm">Change</Button>
        </SettingsRow>
        <SettingsRow label="Vibration" description="Default pattern">
          <Button variant="outline" size="sm">Default</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Groups">
        <SettingsRow label="Group notifications" description="Show notifications for group messages">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
        <SettingsRow label="Mention-only mode" description="Only notify when @mentioned in groups">
          <Button variant="outline" size="sm">Off</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Calls">
        <SettingsRow label="Call notifications" description="Incoming voice and video calls">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
        <SettingsRow label="Ringtone" description="Default">
          <Button variant="outline" size="sm">Change</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Do Not Disturb">
        <SettingsRow label="Schedule quiet hours" description="Silence notifications on a schedule">
          <Button variant="outline" size="sm">Set up</Button>
        </SettingsRow>
        <SettingsRow label="Priority contacts" description="Always notify for these people">
          <Button variant="outline" size="sm">Manage</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Email notifications">
        <SettingsRow label="Security alerts" description="New device login, key changes">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
        <SettingsRow label="Product updates" description="New features and announcements">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
      </SettingsSection>
    </SettingsContainer>
  )
}
