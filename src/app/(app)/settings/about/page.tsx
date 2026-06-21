import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { SettingsContainer, SettingsHeader, SettingsSection } from '@/components/settings/SettingsSection'

export default function AboutSettingsPage() {
  return (
    <SettingsContainer>
      <SettingsHeader title="About" />

      <SettingsSection title="KuikChat">
        <div className="flex items-center gap-4">
          <Logo size={56} showText={false} href={null} />
          <div>
            <p className="text-xl font-bold">KuikChat</p>
            <p className="text-sm text-muted-foreground">Version 0.1.0 (Phase 1 Foundation)</p>
            <p className="mt-1 text-xs text-muted-foreground">kuikchat.io</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          The all-in-one messenger that unifies every messaging experience into one sleek,
          secure, and intelligent app - powered by Hermes AI, built for personal and
          professional use, with zero phone number requirement.
        </p>
      </SettingsSection>

      <SettingsSection title="Legal">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/privacy"><Button variant="outline" className="w-full justify-start">Privacy policy</Button></Link>
          <Link href="/terms"><Button variant="outline" className="w-full justify-start">Terms of service</Button></Link>
          <Link href="/cookies"><Button variant="outline" className="w-full justify-start">Cookie policy</Button></Link>
          <Link href="/dmca"><Button variant="outline" className="w-full justify-start">DMCA</Button></Link>
        </div>
      </SettingsSection>

      <SettingsSection title="Open source">
        <p className="text-sm text-muted-foreground">
          KuikChat is built with love using Next.js, Supabase, OpenAI, Tailwind CSS, and many
          incredible open-source libraries. Thanks to the community.
        </p>
      </SettingsSection>
    </SettingsContainer>
  )
}
