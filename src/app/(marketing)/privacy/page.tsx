import type { Metadata } from 'next'
import { InfoPage } from '@/components/marketing/InfoPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How KuikChat handles account, messaging, file, and support data.',
}

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="KuikChat is designed around private communication, account ownership, and clear handling of the data needed to operate the service."
      sections={[
        {
          title: 'What we collect',
          body: (
            <>
              <p>
                We collect the information needed to create and operate your account, such as
                your email address, username, profile details you choose to add, authentication
                records, device/session metadata, and service logs.
              </p>
              <p>
                KuikChat does not require a phone number to create an account. If future features
                request optional contact information, those features should clearly explain why.
              </p>
            </>
          ),
        },
        {
          title: 'Messages, files, and AI interactions',
          body: (
            <>
              <p>
                KuikChat stores message records, conversation membership, attachment metadata,
                and delivery state so chats can sync across devices and remain reliable.
              </p>
              <p>
                Hermes AI requests are processed only when you choose to use Hermes-powered
                features. Secure FileNinja transfers are routed through the configured FileNinja
                provider and KuikChat stores delivery metadata rather than raw provider secrets.
              </p>
            </>
          ),
        },
        {
          title: 'How we use data',
          body: (
            <p>
              We use data to authenticate users, deliver messages, operate subscriptions and
              support, prevent abuse, monitor reliability, debug errors, and improve product
              quality. We do not sell user data.
            </p>
          ),
        },
        {
          title: 'Security and retention',
          body: (
            <p>
              We use access controls, server-side secrets, row-level database protections, and
              production monitoring practices to protect the service. We keep operational records
              only as long as needed for product functionality, compliance, security, and support.
            </p>
          ),
        },
        {
          title: 'Your choices',
          body: (
            <p>
              You can update profile information from your account settings. For privacy,
              account, or deletion requests, contact support through the Contact or Support page.
            </p>
          ),
        },
      ]}
    />
  )
}
