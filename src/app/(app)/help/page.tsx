'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, UserPlus, Users, ShieldAlert, Key } from 'lucide-react'

export default function HelpCenterPage() {
  const sections = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      color: 'text-brand-blue-500 bg-brand-blue-500/10',
      content: [
        {
          heading: 'Account Creation & Username',
          text: 'Register securely using your email address and a unique username. KuikChat does not require or collect your phone number, allowing you to maintain full ownership over your personal data.',
        },
        {
          heading: 'Profile Customization & QR Codes',
          text: 'Upload a custom profile photo (avatar) and add a bio to introduce yourself. Share your dynamic profile QR code (available on the contacts tab and profile settings) so others can add you instantly.',
        },
      ],
    },
    {
      title: 'Contacts & Organization',
      icon: UserPlus,
      color: 'text-brand-green-500 bg-brand-green-500/10',
      content: [
        {
          heading: 'Adding Contacts',
          text: 'Add other users by searching their exact @username in the Add Contact field. If a user is found, they are added to your contact list immediately.',
        },
        {
          heading: 'Favorites & Close Friends',
          text: 'Organize your chat list by starring contacts as "Favorites" (pinned/highlighted) or marking them as "Close Friends" with the user verification checkmark.',
        },
        {
          heading: 'Custom Labels',
          text: 'Assign contacts to group tags like Work, Family, or Friends, allowing you to filter your contacts panel dynamically and keep your dashboard organized.',
        },
      ],
    },
    {
      title: 'Communities & Channels',
      icon: Users,
      color: 'text-purple-500 bg-purple-500/10',
      content: [
        {
          heading: 'Participating in Communities',
          text: 'Join multi-channel Communities to connect with other users. You can browse community details, read post feeds, and subscribe or unsubscribe as desired.',
        },
        {
          heading: 'Community Channels',
          text: 'Each community contains specialized channels for text chats. Access specific channels to follow ongoing topics or post messages.',
        },
      ],
    },
    {
      title: 'Account Settings & Security',
      icon: Key,
      color: 'text-yellow-500 bg-yellow-500/10',
      content: [
        {
          heading: 'Two-Factor Authentication (2FA)',
          text: 'Enable authenticator app security (TOTP) to protect your account. Scan the setup key in Google Authenticator or Authy to require temporary codes on login.',
        },
        {
          heading: 'Backup Recovery Codes',
          text: 'Generate and download 10 one-time recovery backup codes. If you ever lose access to your authenticator app, these codes can be entered to bypass 2FA and recover your account.',
        },
      ],
    },
  ]

  return (
    <div className="h-full overflow-y-auto bg-background p-6 md:p-8 scrollbar-thin">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header navigation */}
        <Link
          href="/settings/help"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help & Support
        </Link>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Help Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Find answers and master the features of KuikChat
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon
            return (
              <div
                key={sec.title}
                className="rounded-2xl border border-border bg-card/45 p-6 backdrop-blur-xl space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${sec.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{sec.title}</h2>
                </div>

                <div className="divide-y divide-border/60">
                  {sec.content.map((item) => (
                    <div key={item.heading} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                      <h3 className="text-sm font-semibold text-foreground">
                        {item.heading}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Need more help */}
        <div className="rounded-xl border border-border bg-card p-5 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Still have questions? Email our support desk at any time.
          </p>
          <a
            href="mailto:support@kuikchat.io?subject=Support%20Request%20-%20KuikChat"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-gradient px-4 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-opacity"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  )
}
