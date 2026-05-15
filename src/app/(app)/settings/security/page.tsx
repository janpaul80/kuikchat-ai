import { Button } from '@/components/ui/button'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { Lock, Smartphone, Eye } from 'lucide-react'

export default function SecuritySettingsPage() {
  return (
    <SettingsContainer>
      <SettingsHeader title="Security" description="Signal-level encryption meets user-friendly controls" />

      <div className="rounded-xl border border-brand-green-200 bg-brand-green-50/50 p-4 dark:border-brand-green-800 dark:bg-brand-green-900/20">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-brand-green-600" />
          <div>
            <p className="font-semibold text-brand-green-700 dark:text-brand-green-400">
              End-to-end encryption is on
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              All your messages, calls, and media are protected by the Signal Protocol.
              KuikChat servers cannot read your messages.
            </p>
          </div>
        </div>
      </div>

      <SettingsSection title="Two-factor authentication">
        <SettingsRow label="Authenticator app" description="Use TOTP codes from Authy, Google Authenticator, etc.">
          <Button variant="outline" size="sm">Set up</Button>
        </SettingsRow>
        <SettingsRow label="Backup codes" description="Generate one-time recovery codes">
          <Button variant="outline" size="sm">Generate</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="App security">
        <SettingsRow label="App lock" description="Require Face ID / fingerprint / PIN to open KuikChat">
          <Button variant="outline" size="sm">Off</Button>
        </SettingsRow>
        <SettingsRow label="Chat lock" description="Lock specific chats with biometrics">
          <Button variant="outline" size="sm">Manage</Button>
        </SettingsRow>
        <SettingsRow label="Screen security" description="Block screenshots in all chats">
          <Button variant="outline" size="sm">Off</Button>
        </SettingsRow>
        <SettingsRow label="Incognito keyboard" description="Disable keyboard learning in chats">
          <Button variant="outline" size="sm">Off</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Active sessions">
        <SettingsRow
          label="This device"
          description="Active now • Web (Chrome on Windows)"
        >
          <Smartphone className="h-5 w-5 text-muted-foreground" />
        </SettingsRow>
        <Button variant="outline" className="w-full">
          <Eye className="mr-2 h-4 w-4" />
          View all sessions
        </Button>
      </SettingsSection>

      <SettingsSection title="Encryption keys">
        <SettingsRow label="Verify with contact" description="Manually verify encryption keys">
          <Button variant="outline" size="sm">Open</Button>
        </SettingsRow>
        <SettingsRow label="Key change notifications" description="Notify when a contact's keys change">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsRow label="Login alerts" description="Email me when a new device signs in">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
        <SettingsRow label="Self-destruct account" description="Auto-delete after period of inactivity">
          <Button variant="outline" size="sm">Off</Button>
        </SettingsRow>
      </SettingsSection>
    </SettingsContainer>
  )
}
