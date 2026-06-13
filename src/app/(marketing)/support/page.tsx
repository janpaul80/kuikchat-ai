import type { Metadata } from 'next'
import { InfoPage } from '@/components/marketing/InfoPage'

export const metadata: Metadata = {
  title: 'Support',
  description: 'KuikChat launch support and frequently asked questions.',
}

export default function SupportPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Support and launch FAQ"
      description="Answers for early KuikChat users while the web launch stabilizes and the native Android app is prepared."
      sections={[
        {
          title: 'How do I create an account?',
          body: (
            <p>
              Create an account with email and a username. KuikChat does not require a phone
              number to get started.
            </p>
          ),
        },
        {
          title: 'Is the Android app available?',
          body: (
            <p>
              The Android app is planned after web launch stabilization. It will be a real React
              Native Android application with native notifications, file picker, media handling,
              sharing, secure storage, and APK distribution. It will not be a WebView wrapper.
            </p>
          ),
        },
        {
          title: 'Which features are still coming soon?',
          body: (
            <p>
              Voice/video calls, some community tooling, expanded professional workflows,
              Rev-Pro production workers, and VideoAgent planning remain staged rollout items.
              Launch pages and in-app placeholders should label unfinished work clearly.
            </p>
          ),
        },
        {
          title: 'How do FileNinja transfers work?',
          body: (
            <p>
              FileNinja handles secure professional file delivery through provider-side upload,
              expiry, and delivery controls. KuikChat coordinates the chat experience and stores
              transfer metadata for the message view.
            </p>
          ),
        },
        {
          title: 'Where do I report a problem?',
          body: (
            <p>
              Send account or product issues to support@kuikchat.com. Send suspected security
              issues to security@kuikchat.com.
            </p>
          ),
        },
      ]}
    />
  )
}
