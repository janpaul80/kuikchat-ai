import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — Stripe routes will fail until configured')
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
  plus_monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY || '',
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
  hermes_pro_monthly: process.env.STRIPE_PRICE_HERMES_PRO_MONTHLY || '',
} as const

export type PlanKey = keyof typeof STRIPE_PRICE_IDS
