import { Button } from '@/components/ui/button'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'

const VISIBILITY_OPTIONS = ['Everyone', 'Contacts', 'Nobody']

export default function PrivacySettingsPage() {
  return (
    <SettingsContainer>
      <SettingsHeader title="Privacy" description="Control who can see what" />

      <SettingsSection title="Who can see..." description="Defaults apply to everyone unless customized">
        <SettingsRow label="Last seen & online" description="Everyone">
          <Button variant="outline" size="sm">Change</Button>
        </SettingsRow>
        <SettingsRow label="Profile photo" description="Everyone">
          <Button variant="outline" size="sm">Change</Button>
        </SettingsRow>
        <SettingsRow label="Bio" description="Contacts">
          <Button variant="outline" size="sm">Change</Button>
        </SettingsRow>
        <SettingsRow label="Read receipts" description="Show blue ticks">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
        <SettingsRow label="Typing indicator" description="Show when you're typing">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Disappearing messages" description="Set a default timer for new chats">
        <SettingsRow label="Default timer" description="Off">
          <Button variant="outline" size="sm">Change</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Ghost mode" description="Go completely invisible">
        <SettingsRow
          label="Enable ghost mode"
          description="No online status, no last seen, no read receipts"
        >
          <Button variant="outline" size="sm">Off</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Blocked contacts">
        <SettingsRow label="Blocked users" description="0 blocked">
          <Button variant="outline" size="sm">Manage</Button>
        </SettingsRow>
      </SettingsSection>
    </SettingsContainer>
  )
}
