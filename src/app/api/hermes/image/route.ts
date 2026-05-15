import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage, isHermesConfigured } from '@/lib/openai/hermes'

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

    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!isHermesConfigured()) {
      return NextResponse.json(
        { error: 'Hermes is not configured. Set LANGDOCK_API_KEY in .env.local.' },
        { status: 503 }
      )
    }

    const url = await generateImage(prompt)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[hermes/image]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Image generation failed' },
      { status: 500 }
    )
  }
}
