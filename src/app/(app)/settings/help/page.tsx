import { Button } from '@/components/ui/button'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { MessageSquare, BookOpen, Mail, ShieldCheck } from 'lucide-react'

export default function HelpSettingsPage() {
  return (
    <SettingsContainer>
      <SettingsHeader title="Help & Support" description="We're here to help" />

      <SettingsSection title="Get help">
        <SettingsRow label="Help center" description="Browse articles and tutorials">
          <Button variant="outline" size="sm">
            <BookOpen className="mr-2 h-4 w-4" />
            Open
          </Button>
        </SettingsRow>
        <SettingsRow label="Contact support" description="Email our team">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            support@kuik.social
          </Button>
        </SettingsRow>
        <SettingsRow label="Chat with Hermes" description="Get instant AI-powered help">
          <Button variant="gradient" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask Hermes
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Report">
        <SettingsRow label="Report a bug" description="Help us improve KuikChat">
          <Button variant="outline" size="sm">Report</Button>
        </SettingsRow>
        <SettingsRow label="Report a user" description="Report inappropriate behavior">
          <Button variant="outline" size="sm">Report</Button>
        </SettingsRow>
        <SettingsRow label="Request a feature" description="Tell us what you want next">
          <Button variant="outline" size="sm">Request</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Trust & safety">
        <SettingsRow
          label="Safety center"
          description="Tips and tools to stay safe on KuikChat"
        >
          <Button variant="outline" size="sm">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Open
          </Button>
        </SettingsRow>
      </SettingsSection>
    </SettingsContainer>
  )
}
