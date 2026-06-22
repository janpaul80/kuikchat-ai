import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import {
  SettingsContainer,
  SettingsHeader,
} from '@/components/settings/SettingsSection'
import { BillingForm } from '@/components/settings/BillingForm'

export default async function BillingSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('plan, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching user profile for billing:', error)
    return (
      <SettingsContainer>
        <SettingsHeader title="Billing" description="Manage your subscription and add-ons" />
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-base font-bold">Failed to load billing details</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            We encountered a database error or your profile is still initializing. Please refresh the page or contact support.
          </p>
        </div>
      </SettingsContainer>
    )
  }

  return (
    <SettingsContainer>
      <SettingsHeader title="Billing" description="Manage your subscription and add-ons" />
      <BillingForm
        initialPlan={profile.plan || 'free'}
        subscriptionStatus={profile.subscription_status || 'inactive'}
        hasPaymentMethod={!!profile.stripe_customer_id}
      />
    </SettingsContainer>
  )
}

