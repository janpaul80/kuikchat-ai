import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabaseRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return url.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1] || null
}

function readFlag(name: string) {
  return (process.env[name] || '').trim().toLowerCase()
}

export async function GET() {
  const startedAt = Date.now()
  let supabaseReachable = false
  let supabaseError: string | null = null

  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('profiles').select('id', {
      count: 'exact',
      head: true,
    })

    supabaseReachable = !error
    supabaseError = error?.message || null
  } catch (error) {
    supabaseError = error instanceof Error ? error.message : 'health_check_failed'
  }

  const ok = supabaseReachable

  return NextResponse.json(
    {
      ok,
      service: 'kuikchat',
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      supabase: {
        ref: getSupabaseRef(),
        reachable: supabaseReachable,
        error: supabaseError,
      },
      features: {
        fileninja: readFlag('FILENINJA_PROVIDER_ENABLED') === 'true',
        revpro: readFlag('REVPRO_PROVIDER_ENABLED') === 'true',
        androidDownload: readFlag('NEXT_PUBLIC_ANDROID_DOWNLOAD_ENABLED') === 'true',
        calls: readFlag('NEXT_PUBLIC_ENABLE_CALLS') === 'true',
        hermes: readFlag('NEXT_PUBLIC_ENABLE_HERMES') === 'true',
        stripe: readFlag('NEXT_PUBLIC_ENABLE_STRIPE') === 'true',
        iosStatus: process.env.NEXT_PUBLIC_IOS_STATUS || 'unknown',
      },
    },
    { status: ok ? 200 : 503 }
  )
}
