import { Button } from '@/components/ui/button'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { MessageSquare, BookOpen, Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function HelpSettingsPage() {
  return (
    <SettingsContainer>
      <SettingsHeader title="Help & Support" description="We're here to help" />

      <SettingsSection title="Get help">
        <SettingsRow label="Help center" description="Browse articles and tutorials">
          <Link href="/help" passHref>
            <Button variant="outline" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              Open
            </Button>
          </Link>
        </SettingsRow>
        <SettingsRow label="Contact support" description="Email our team">
          <a href="mailto:support@kuikchat.io?subject=Support%20Request%20-%20KuikChat">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              support@kuikchat.io
            </Button>
          </a>
        </SettingsRow>
        <SettingsRow label="Chat with Hermes" description="Get instant AI-powered help">
          <Link href="/hermes" passHref>
            <Button variant="gradient" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask Hermes
            </Button>
          </Link>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Report">
        <SettingsRow label="Report a bug" description="Help us improve KuikChat">
          <a href="mailto:support@kuikchat.io?subject=Bug%20Report%20-%20KuikChat&body=Steps%20to%20reproduce%3A%0A1.%0A2.%0A%0AExpected%20Behavior%3A%0A%0AActual%20Behavior%3A">
            <Button variant="outline" size="sm">Report</Button>
          </a>
        </SettingsRow>
        <SettingsRow label="Report a user" description="Report inappropriate behavior">
          <a href="mailto:support@kuikchat.io?subject=Report%20User%20-%20KuikChat&body=Reported%20Username%3A%0A%0ADetails%20of%20Violation%3A">
            <Button variant="outline" size="sm">Report</Button>
          </a>
        </SettingsRow>
        <SettingsRow label="Request a feature" description="Tell us what you want next">
          <a href="mailto:support@kuikchat.io?subject=Feature%20Request%20-%20KuikChat&body=Describe%20your%20suggested%20feature%20here%3A">
            <Button variant="outline" size="sm">Request</Button>
          </a>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Trust & safety">
        <SettingsRow
          label="Safety center"
          description="Tips and tools to stay safe on KuikChat"
        >
          <Link href="/safety" passHref>
            <Button variant="outline" size="sm">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Open
            </Button>
          </Link>
        </SettingsRow>
      </SettingsSection>
    </SettingsContainer>
  )
}
