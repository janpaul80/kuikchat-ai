import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { selfHealProfile } from '@/lib/supabase/selfHeal'

export async function GET(request: Request) {
  // Parse request URL to get search parameters
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/chats'

  // Use the canonical site URL from env vars, fallback to parsed origin if missing
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      try {
        const serviceClient = createServiceRoleClient()
        await selfHealProfile(
          serviceClient,
          data.user.id,
          data.user.email,
          data.user.user_metadata
        )
      } catch (err) {
        console.error('Self-healing profile error in callback:', err)
      }
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_error`)
}

