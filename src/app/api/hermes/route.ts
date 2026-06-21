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

    const response = await chatWithHermes({ messages, mode, stream: false })
    // chatWithHermes returns a non-streamed completion when stream=false.
    // Cast to the known shape; the union with the stream type is narrowed here.
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
