import { NextResponse } from 'next/server'
import { routeIntegrationIntent } from '@/lib/integrations/router'
import { getIntegrationStatuses } from '@/lib/integrations/config'
import type { IntegrationIntent, IntegrationIntentKind, IntegrationProviderId } from '@/lib/integrations/types'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supportedProviders = new Set<IntegrationProviderId>(['fileninja', 'revpro'])
const supportedKinds = new Set<IntegrationIntentKind>([
  'file.transfer',
  'media.transcribe',
  'media.summarize',
  'media.caption',
  'media.notes',
])

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ providers: getIntegrationStatuses() })
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const provider = body.provider as IntegrationProviderId | undefined
    const kind = body.kind as IntegrationIntentKind | undefined
    const chatId = typeof body.chatId === 'string' ? body.chatId : ''

    if (!provider || !supportedProviders.has(provider) || !kind || !supportedKinds.has(kind) || !chatId) {
      return NextResponse.json({ error: 'Invalid integration intent' }, { status: 400 })
    }

    const { data: membership, error: membershipError } = await supabase
      .from('chat_members')
      .select('id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membershipError) {
      return NextResponse.json({ error: 'Unable to verify chat membership' }, { status: 500 })
    }

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const intent = {
      provider,
      kind,
      chatId,
      userId: user.id,
      sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : undefined,
      sourceMessageId: typeof body.sourceMessageId === 'string' ? body.sourceMessageId : undefined,
      fileName: typeof body.fileName === 'string' ? body.fileName : undefined,
      fileSize: typeof body.fileSize === 'number' ? body.fileSize : undefined,
      mimeType: typeof body.mimeType === 'string' ? body.mimeType : undefined,
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : undefined,
    } as IntegrationIntent

    const result = await routeIntegrationIntent(intent)
    const status = result.status === 'failed' ? 500 : result.status === 'unavailable' ? 503 : 202

    return NextResponse.json({ result }, { status })
  } catch (err) {
    console.error('[integrations/intent]', err)
    return NextResponse.json({ error: 'Integration intent failed' }, { status: 500 })
  }
}
