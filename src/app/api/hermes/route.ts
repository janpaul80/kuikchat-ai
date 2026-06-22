import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  chatWithHermes,
  isHermesConfigured,
  type HermesMode,
  type HermesMessage,
} from '@/lib/openai/hermes'
import { sanitizeHermesOutput } from '@/lib/noLongDashes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function buildBusinessContext(supabase: any, userId: string): Promise<string> {
  const parts: string[] = []

  try {
    // Fetch business profile
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('company_name, category, website, email, phone, description, hours, address')
      .eq('user_id', userId)
      .maybeSingle()

    if (profile) {
      parts.push('--- Business Profile ---')
      if (profile.company_name) parts.push(`Company: ${profile.company_name}`)
      if (profile.category) parts.push(`Category: ${profile.category}`)
      if (profile.description) parts.push(`Description: ${profile.description}`)
      if (profile.website) parts.push(`Website: ${profile.website}`)
      if (profile.email) parts.push(`Email: ${profile.email}`)
      if (profile.phone) parts.push(`Phone: ${profile.phone}`)
      if (profile.address) {
        try {
          const addr = JSON.parse(profile.address)
          if (addr.addressText) parts.push(`Location: ${addr.addressText}`)
        } catch {
          parts.push(`Address: ${profile.address}`)
        }
      }
    }

    // Fetch catalog items
    const { data: catalog } = await supabase
      .from('catalog_items')
      .select('name, description, price_cents, currency, in_stock, category')
      .eq('business_id', userId)
      .eq('in_stock', true)
      .order('position', { ascending: true })
      .limit(20)

    if (catalog && catalog.length > 0) {
      parts.push('\n--- Product Catalog ---')
      for (const item of catalog) {
        const priceStr = item.price_cents
          ? `$${(item.price_cents / 100).toFixed(2)}`
          : 'Price on request'
        const stockStr = item.in_stock ? 'In Stock' : 'Out of Stock'
        parts.push(
          `• ${item.name} — ${priceStr} [${stockStr}]${item.description ? ': ' + item.description : ''}`
        )
      }
    }

    // Fetch quick replies
    const { data: qr } = await supabase
      .from('quick_replies')
      .select('shortcut, body')
      .eq('user_id', userId)
      .limit(10)

    if (qr && qr.length > 0) {
      parts.push('\n--- Quick Reply Templates ---')
      for (const r of qr) {
        parts.push(`${r.shortcut}: "${r.body}"`)
      }
    }
  } catch (err) {
    console.warn('[Hermes] Could not fetch business context:', err)
  }

  return parts.length > 0
    ? `\n\nYou are acting as a business assistant for this account. Use the following business context to provide helpful, accurate, and personalized responses:\n\n${parts.join('\n')}`
    : ''
}

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const messages = body.messages as HermesMessage[]
    const mode = (body.mode as HermesMode) || 'casual'
    const useBizContext = body.useBizContext === true

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    if (!isHermesConfigured()) {
      return NextResponse.json(
        {
          reply:
            "⚠️ Hermes is not configured yet. Add LANGDOCK_API_KEY to your .env.local to enable AI replies.",
        },
        { status: 200 }
      )
    }

    // Inject business context for business-mode requests
    let enrichedMessages = messages
    if (useBizContext) {
      const bizContext = await buildBusinessContext(supabase, user.id)
      if (bizContext) {
        // Prepend business context as a system message at the start of the conversation
        enrichedMessages = [
          { role: 'system', content: bizContext } as HermesMessage,
          ...messages.filter((m) => m.role !== 'system'), // remove any existing system msgs to avoid duplication
        ]
      }
    }

    const response = await chatWithHermes({ messages: enrichedMessages, mode, stream: false })
    // chatWithHermes returns a non-streamed completion when stream=false.
    const replyRaw =
      (response as { choices?: Array<{ message?: { content?: string | null } }> })
        .choices?.[0]?.message?.content ?? "I couldn't generate a response."
    const reply = sanitizeHermesOutput(replyRaw)

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[Hermes API] Error:', err)
    return NextResponse.json(
      { error: 'Hermes encountered an error. Please try again.' },
      { status: 500 }
    )
  }
}
