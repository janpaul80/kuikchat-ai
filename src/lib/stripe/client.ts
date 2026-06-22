import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set - Stripe routes will fail until configured')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
  appInfo: {
    name: 'KuikChat',
    version: '0.1.0',
    url: 'https://kuikchat.io',
  },
})

export const STRIPE_PRICE_IDS = {
  ultra_monthly: process.env.STRIPE_PRICE_ULTRA_MONTHLY || process.env.STRIPE_PRICE_ULTRA || '',
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || process.env.STRIPE_PRICE_BUSINESS || '',
  addon_badge_colors: process.env.STRIPE_ADDON_BADGE_COLORS || '',
  addon_priority_support: process.env.STRIPE_ADDON_PRIORITY_SUPPORT || '',
  addon_backup_vault: process.env.STRIPE_ADDON_BACKUP_VAULT || '',
} as const

export type PlanKey = keyof typeof STRIPE_PRICE_IDS
