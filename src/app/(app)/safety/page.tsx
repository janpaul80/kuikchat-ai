'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Ban, Key, ShieldAlert } from 'lucide-react'

export default function SafetyCenterPage() {
  const sections = [
    {
      title: 'Account Settings & Protection',
      icon: Key,
      color: 'text-brand-green-500 bg-brand-green-500/10',
      content: [
        {
          heading: 'Two-Factor Authentication (2FA)',
          text: 'Enable authenticator app security (TOTP) to protect your account. Scan the setup key in Google Authenticator or Authy to require temporary verification codes on login.',
        },
        {
          heading: 'Backup Recovery Codes',
          text: 'Generate and download 10 one-time recovery backup codes. If you ever lose access to your authenticator app, these codes can be entered to bypass 2FA and recover your account safely.',
        },
      ],
    },
    {
      title: 'Contact Control & Blocklist',
      icon: Ban,
      color: 'text-destructive bg-destructive/10',
      content: [
        {
          heading: 'Managing Your Blocklist',
          text: 'Open the Blocked Contacts modal on the Contacts tab to view all users you have blocked. You can unblock any user immediately from this dashboard to restore communications.',
        },
        {
          heading: 'Abuse & Harassment Reporting',
          text: 'If a user is violating safety guidelines or harassing you, contact our support desk directly via email. Include their username and violation details so our team can take action.',
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            Safety Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Tools and guidelines to keep your conversations secure and private
          </p>
        </div>

        {/* Info banner */}
        <div className="rounded-xl border border-brand-blue-800/30 bg-brand-blue-900/10 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-blue-400 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-blue-400 text-sm">
                Your privacy is our priority
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                KuikChat is built on a foundation of decentralized identifiers, email auth without phone numbers, and full client-side privacy controls. Master these settings to secure your profile.
              </p>
            </div>
          </div>
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

        {/* Reporting abuse */}
        <div className="rounded-xl border border-border bg-card p-5 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Encountered harassment or suspect a safety threat? Report it directly to our safety desk.
          </p>
          <a
            href="mailto:support@kuikchat.io?subject=Report%20User%20-%20KuikChat"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-gradient px-4 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-opacity"
          >
            Report Violation
          </a>
        </div>
      </div>
    </div>
  )
}
