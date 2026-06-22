import Stripe from 'stripe'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const stripeKey = process.env.STRIPE_SECRET_KEY
if (!stripeKey) {
  console.error("Error: STRIPE_SECRET_KEY is not defined in .env.local")
  process.exit(1)
}
const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })

async function run() {
  try {
    console.log("Fetching or creating KuikChat Stripe Product...")
    let products = await stripe.products.list({ limit: 100 })
    let kuikchatProduct = products.data.find(p => p.name === 'KuikChat')

    if (!kuikchatProduct) {
      kuikchatProduct = await stripe.products.create({
        name: 'KuikChat',
        description: 'KuikChat - The All-in-One Messenger + AI Agent Platform',
      })
      console.log(`Created product: ${kuikchatProduct.id}`)
    } else {
      console.log(`Found existing product: ${kuikchatProduct.id}`)
    }

    const prices = await stripe.prices.list({ product: kuikchatProduct.id, limit: 100 })

    // Find or create Ultra Monthly price ($4.99)
    let ultraPrice = prices.data.find(p => p.unit_amount === 499 && p.recurring?.interval === 'month')
    if (!ultraPrice) {
      ultraPrice = await stripe.prices.create({
        product: kuikchatProduct.id,
        unit_amount: 499,
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Ultra Plan',
      })
      console.log(`Created Ultra Price: ${ultraPrice.id}`)
    } else {
      console.log(`Found existing Ultra Price: ${ultraPrice.id}`)
    }

    // Find or create Business Monthly price ($19.00)
    let businessPrice = prices.data.find(p => p.unit_amount === 1900 && p.recurring?.interval === 'month')
    if (!businessPrice) {
      businessPrice = await stripe.prices.create({
        product: kuikchatProduct.id,
        unit_amount: 1900,
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Business Plan',
      })
      console.log(`Created Business Price: ${businessPrice.id}`)
    } else {
      console.log(`Found existing Business Price: ${businessPrice.id}`)
    }

    console.log("\nCopy these values to .env.local on the server:")
    console.log(`STRIPE_PRICE_ULTRA=${ultraPrice.id}`)
    console.log(`STRIPE_PRICE_BUSINESS=${businessPrice.id}`)

  } catch (error) {
    console.error("Error creating/fetching Stripe resources:", error)
  }
}

run()
