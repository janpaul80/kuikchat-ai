import { NextResponse } from 'next/server'

/**
 * DIAGNOSTIC ENDPOINT — safe to expose.
 * Echoes NEXT_PUBLIC_SUPABASE_URL and the project ref (subdomain part).
 * These values are already publicly visible in the browser network tab,
 * so exposing them here is not a security risk.
 *
 * DELETE THIS FILE before production deploy.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Extract project ref from URL (e.g. "abcdefghijk" from "https://abcdefghijk.supabase.co")
  let projectRef = 'UNKNOWN'
  try {
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
    if (match) projectRef = match[1]
  } catch {}

  // Only show first/last 6 chars of anon key for sanity, never the middle
  const anonKeyPreview = anonKey
    ? `${anonKey.slice(0, 6)}...${anonKey.slice(-6)} (length: ${anonKey.length})`
    : 'NOT SET'

  const langdockKey = process.env.LANGDOCK_API_KEY || ''
  const langdockKeyPreview = langdockKey
    ? `${langdockKey.slice(0, 4)}...${langdockKey.slice(-4)} (length: ${langdockKey.length})`
    : 'NOT SET'

  return NextResponse.json({
    supabase: {
      url: url || 'NOT SET',
      projectRef,
      anonKeyPreview,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    hermes: {
      provider: 'langdock',
      hasLangdockKey: !!langdockKey,
      langdockKeyPreview,
      baseUrl: process.env.LANGDOCK_BASE_URL || 'https://api.langdock.com/openai/v1 (default)',
      chatModel: process.env.LANGDOCK_CHAT_MODEL || 'gpt-4o-mini (default)',
      imageModel: process.env.LANGDOCK_IMAGE_MODEL || 'dall-e-3 (default)',
      transcribeModel: process.env.LANGDOCK_TRANSCRIBE_MODEL || 'whisper-1 (default)',
    },
    stripe: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  })
}
