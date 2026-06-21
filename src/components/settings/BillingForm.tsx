'use client'

import { useState } from 'react'
import { Check, Sparkles, Zap, Building2, Crown, Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { toast } from 'sonner'

interface BillingFormProps {
  initialPlan: string
  subscriptionStatus: string
  hasPaymentMethod: boolean
}

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    icon: Sparkles,
    perks: ['All core messaging', 'Hermes basic (10 queries/day)', 'Up to 1,024 group members'],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '$4.99/mo',
    icon: Zap,
    perks: ['50 GB file storage', 'Verified Blue Badge', 'Hermes Expanded (200 queries/day)', 'Premium themes'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$19/mo',
    icon: Building2,
    perks: ['200 GB file storage', 'Verified Blue Badge', 'Hermes Unlimited', 'Team seats & inbox', 'Priority support'],
  },
]

export function BillingForm({ initialPlan, subscriptionStatus, hasPaymentMethod }: BillingFormProps) {
  const [currentPlan, setCurrentPlan] = useState(initialPlan)
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  const handleUpgrade = async (tierId: string) => {
    if (tierId === 'free') return
    setLoadingTier(tierId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: `${tierId}_monthly` }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Upgrade checkout redirect failed')
    } finally {
      setLoadingTier(null)
    }
  }

  const handlePortalRedirect = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Billing portal redirect failed')
    } finally {
      setLoadingPortal(false)
    }
  }

  const handleBuyAddon = async (addonKey: string) => {
    setLoadingTier(addonKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: addonKey }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Add-on purchase failed')
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection title="Current plan">
        <div className="flex items-center justify-between rounded-xl bg-brand-gradient p-6 text-white">
          <div>
            <p className="text-sm opacity-90">You're on</p>
            <p className="text-3xl font-bold uppercase">KuikChat {currentPlan}</p>
            <p className="mt-1 text-sm opacity-90">
              {subscriptionStatus === 'active' ? 'Subscription is active' : 'Upgrade for premium capabilities'}
            </p>
          </div>
          <Sparkles className="h-12 w-12 opacity-50" />
        </div>
      </SettingsSection>

      <SettingsSection title="Available plans">
        <div className="grid gap-4 sm:grid-cols-3">
          {TIERS.map((t) => {
            const Icon = t.icon
            const isCurrent = t.id === currentPlan
            const isLoading = loadingTier === t.id
            return (
              <div
                key={t.id}
                className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-5"
              >
                {isCurrent && (
                  <Badge variant="gradient" className="absolute right-3 top-3">
                    Current
                  </Badge>
                )}
                <div>
                  <Icon className="mb-3 h-6 w-6 text-brand-blue-500" />
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <p className="mt-1 text-2xl font-bold">{t.price}</p>
                  <ul className="mt-4 space-y-2">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green-500" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  className="mt-6 w-full"
                  variant={isCurrent ? 'outline' : 'gradient'}
                  disabled={isCurrent || isLoading}
                  onClick={() => handleUpgrade(t.id)}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrent ? 'Current plan' : 'Upgrade'}
                </Button>
              </div>
            )
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="Ultra & Business Add-ons">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card/30">
            <div>
              <p className="font-semibold">Custom Badge Colors (Business only)</p>
              <p className="text-xs text-muted-foreground">
                Tints your verification badge gold, green, or obsidian black
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">$0.99/mo</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => handleBuyAddon('addon_badge_colors')} disabled={loadingTier === 'addon_badge_colors'}>
                {loadingTier === 'addon_badge_colors' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Add
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card/30">
            <div>
              <p className="font-semibold">Priority Support Operator Seats</p>
              <p className="text-xs text-muted-foreground">
                Adds additional helper operator seats to your Team Inbox
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">$4.99/mo</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => handleBuyAddon('addon_priority_support')} disabled={loadingTier === 'addon_priority_support'}>
                {loadingTier === 'addon_priority_support' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Add
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card/30">
            <div>
              <p className="font-semibold">Dedicated daily conversation backups</p>
              <p className="text-xs text-muted-foreground">
                Encrypted daily backup zip sent straight to your email inbox
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">$2.99/mo</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => handleBuyAddon('addon_backup_vault')} disabled={loadingTier === 'addon_backup_vault'}>
                {loadingTier === 'addon_backup_vault' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Add
              </Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Payment & invoices">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {hasPaymentMethod
              ? 'Payment details are securely stored on Stripe.'
              : 'No payment method on file. Add one to upgrade your plan.'}
          </div>
          {hasPaymentMethod ? (
            <Button variant="outline" onClick={handlePortalRedirect} disabled={loadingPortal}>
              {loadingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CreditCard className="mr-2 h-4 w-4" />
              Manage billing portal
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePortalRedirect} disabled={loadingPortal}>
              {loadingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add payment method
            </Button>
          )}
        </div>
      </SettingsSection>
    </div>
  )
}
