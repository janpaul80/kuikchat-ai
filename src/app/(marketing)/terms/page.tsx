import type { Metadata } from 'next'
import { InfoPage } from '@/components/marketing/InfoPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules and expectations for using KuikChat.',
}

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Service"
      description="These terms describe the baseline rules for using KuikChat during launch and early production."
      sections={[
        {
          title: 'Using KuikChat',
          body: (
            <p>
              You are responsible for your account activity and for keeping your login credentials
              secure. You may not use KuikChat to abuse, harass, defraud, distribute malware,
              violate law, or interfere with the service.
            </p>
          ),
        },
        {
          title: 'Accounts and availability',
          body: (
            <p>
              KuikChat is launching in stages. Some capabilities may be marked Coming Soon,
              limited, disabled by feature flag, or changed as the product stabilizes. We may
              suspend access when needed to protect users, infrastructure, or the service.
            </p>
          ),
        },
        {
          title: 'Content and files',
          body: (
            <p>
              You keep responsibility for the messages and files you send. FileNinja-powered
              transfers may include expiry, revocation, size, and security controls. Do not upload
              content you do not have the right to share.
            </p>
          ),
        },
        {
          title: 'Hermes AI',
          body: (
            <p>
              Hermes can help draft, summarize, translate, and analyze content, but AI output can
              be incomplete or incorrect. Review important output before relying on it for legal,
              medical, financial, or safety decisions.
            </p>
          ),
        },
        {
          title: 'Subscriptions and changes',
          body: (
            <p>
              Paid plans, limits, and store distribution details may evolve after launch. When
              billing is active, subscription terms will be shown at checkout and in account
              settings.
            </p>
          ),
        },
      ]}
    />
  )
}
