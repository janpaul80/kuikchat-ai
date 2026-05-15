import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
} from '@/components/settings/SettingsSection'
import { Sparkles, Zap, Building2, Crown, Check } from 'lucide-react'

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    icon: Sparkles,
    perks: ['All core messaging', 'Hermes basic', 'Up to 1,024 group members'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$4.99/mo',
    icon: Zap,
    perks: ['2GB file uploads', 'Premium themes', 'Extended chat history'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12.99/mo',
    icon: Crown,
    perks: ['Professional Mode', 'Analytics + Team inbox', 'API access'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$29.99/mo',
    icon: Building2,
    perks: ['Full CRM', 'Team seats', 'Priority support'],
  },
]

export default function BillingSettingsPage() {
  const currentPlan = 'free'

  return (
    <SettingsContainer>
      <SettingsHeader title="Billing" description="Manage your subscription and add-ons" />

      <SettingsSection title="Current plan">
        <div className="flex items-center justify-between rounded-xl bg-brand-gradient p-6 text-white">
          <div>
            <p className="text-sm opacity-90">You're on</p>
            <p className="text-3xl font-bold">KuikChat Free</p>
            <p className="mt-1 text-sm opacity-90">Upgrade for more features</p>
          </div>
          <Sparkles className="h-12 w-12 opacity-50" />
        </div>
      </SettingsSection>

      <SettingsSection title="Available plans">
        <div className="grid gap-4 sm:grid-cols-2">
          {TIERS.map((t) => {
            const Icon = t.icon
            const isCurrent = t.id === currentPlan
            return (
              <div
                key={t.id}
                className="relative rounded-xl border border-border bg-card p-5"
              >
                {isCurrent && (
                  <Badge variant="gradient" className="absolute right-3 top-3">
                    Current
                  </Badge>
                )}
                <Icon className="mb-3 h-6 w-6 text-brand-blue-500" />
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="mt-1 text-2xl font-bold">{t.price}</p>
                <ul className="mt-3 space-y-1.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-500" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4 w-full"
                  variant={isCurrent ? 'outline' : 'gradient'}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current plan' : 'Upgrade'}
                </Button>
              </div>
            )
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="Add-ons">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Hermes Pro</p>
              <p className="text-sm text-muted-foreground">
                Advanced AI: image gen, doc analysis, meeting notes
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">$2.99/mo</p>
              <Button size="sm" variant="outline" className="mt-2">Add</Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Payment & invoices">
        <div className="text-sm text-muted-foreground">
          No payment method on file. Add one to upgrade your plan.
        </div>
        <Button variant="outline">Add payment method</Button>
        <div className="text-xs text-muted-foreground">
          Compare all plans on our{' '}
          <Link href="/pricing" className="text-brand-blue-500 hover:underline">
            pricing page
          </Link>
          .
        </div>
      </SettingsSection>
    </SettingsContainer>
  )
}
