import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
    redirect('/chats')
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

