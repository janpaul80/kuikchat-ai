import type { Metadata } from 'next'
import { InfoPage } from '@/components/marketing/InfoPage'

export const metadata: Metadata = {
  title: 'Security',
  description: 'KuikChat security posture for messaging, accounts, AI, and FileNinja transfers.',
}

export default function SecurityPage() {
  return (
    <InfoPage
      eyebrow="Security"
      title="Security at KuikChat"
      description="KuikChat launch readiness focuses on private account access, secure server-side integrations, clear feature flags, and safe handling of messages and files."
      sections={[
        {
          title: 'Private account model',
          body: (
            <p>
              KuikChat uses email-based authentication and does not require a phone number.
              Account access is handled through Supabase authentication, protected routes, and
              session-aware server checks.
            </p>
          ),
        },
        {
          title: 'Messaging security',
          body: (
            <p>
              KuikChat presents private messaging with an end-to-end encryption focus and
              authenticated realtime access. Chat membership checks, row-level protections, and
              server-side validation are part of the launch security surface.
            </p>
          ),
        },
        {
          title: 'Hermes AI controls',
          body: (
            <p>
              Hermes runs through server-side routes so provider credentials stay out of the
              browser. AI features should be limited, observable, and disabled cleanly when the
              provider is not configured.
            </p>
          ),
        },
        {
          title: 'FileNinja transfers',
          body: (
            <p>
              FileNinja credentials remain server-side. KuikChat verifies chat context before
              creating upload sessions, stores delivery metadata rather than raw provider secrets,
              and relies on FileNinja for secure delivery, expiry, and revocation.
            </p>
          ),
        },
        {
          title: 'Reporting security issues',
          body: (
            <p>
              Please report suspected vulnerabilities or abuse to security@kuikchat.com with a
              clear description, reproduction steps if available, and any relevant account or URL
              context.
            </p>
          ),
        },
      ]}
    />
  )
}
