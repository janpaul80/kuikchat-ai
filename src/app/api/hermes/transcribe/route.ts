import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transcribeAudio, isHermesConfigured } from '@/lib/openai/hermes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isHermesConfigured()) {
      return NextResponse.json(
        { error: 'Hermes is not configured. Set LANGDOCK_API_KEY in .env.local.' },
        { status: 503 }
      )
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 })
    }

    const text = await transcribeAudio(file)
    return NextResponse.json({ text })
  } catch (err) {
    console.error('[hermes/transcribe]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Transcription failed' },
      { status: 500 }
    )
  }
}
