import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { routeIntegrationIntent } from '@/lib/integrations/router'
import { getIntegrationStatuses } from '@/lib/integrations/config'
import type { IntegrationIntent, IntegrationIntentKind, IntegrationProviderId } from '@/lib/integrations/types'
import { fileNinjaProvider } from '@/lib/integrations/fileninja/provider'
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

function containsSecretLikeValue(value: unknown): boolean {
  if (typeof value === 'string') {
    return /service_role|signedUploadUrl|signed_upload|token=|Bearer\s+/i.test(value)
  }

  if (Array.isArray(value)) return value.some(containsSecretLikeValue)
  if (!value || typeof value !== 'object') return false

  return Object.entries(value as Record<string, unknown>).some(([key, nested]) => {
    if (/apiKey|serviceRole|signedUploadUrl|signedUploadToken/i.test(key)) return true
    return containsSecretLikeValue(nested)
  })
}

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

    const pendingMessageId = provider === 'fileninja' && kind === 'file.transfer' ? randomUUID() : undefined
    const metadata = body.metadata && typeof body.metadata === 'object'
      ? { ...(body.metadata as Record<string, unknown>) }
      : {}

    if (pendingMessageId) {
      metadata.pendingMessageId = pendingMessageId
      metadata.externalReference = `kuikchat:${chatId}:${pendingMessageId}`
      if (user.email) metadata.senderEmail = user.email
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
      metadata,
    } as IntegrationIntent

    if (intent.provider === 'fileninja' && intent.kind === 'file.transfer') {
      const validationError = fileNinjaProvider.validateTransferIntent(intent)
      if (validationError) {
        return NextResponse.json(
          {
            result: {
              provider: 'fileninja',
              kind: 'file.transfer',
              status: 'failed',
              message: validationError,
            },
          },
          { status: 400 }
        )
      }
    }

    const result = await routeIntegrationIntent(intent)

    if (intent.provider === 'fileninja' && intent.kind === 'file.transfer' && result.status === 'accepted') {
      const pendingMessage = fileNinjaProvider.buildPendingMessage(intent, result)

      if (containsSecretLikeValue(pendingMessage.metadata)) {
        return NextResponse.json(
          {
            result: {
              provider: 'fileninja',
              kind: 'file.transfer',
              status: 'failed',
              message: 'Refusing to persist unsafe FileNinja metadata.',
            },
          },
          { status: 500 }
        )
      }

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          id: pendingMessage.id,
          chat_id: pendingMessage.chatId,
          sender_id: user.id,
          type: pendingMessage.type,
          body: pendingMessage.body,
          metadata: pendingMessage.metadata,
        })
        .select('id, chat_id, sender_id, type, body, metadata, reply_to_id, edited_at, deleted_at, deleted_for_everyone, created_at')
        .single()

      if (messageError || !message) {
        return NextResponse.json(
          {
            result: {
              provider: 'fileninja',
              kind: 'file.transfer',
              status: 'failed',
              message: 'FileNinja transfer was created, but pending KuikChat message creation failed.',
              metadata: {
                integrationSlice: 'FN-KC-2',
                status: 'orphaned_transfer_created',
                transferId: result.metadata?.transferId,
                messageError: messageError?.message,
              },
            },
          },
          { status: 500 }
        )
      }

      result.metadata = {
        ...result.metadata,
        messageId: message.id,
        messageStatus: message.metadata?.status,
      }
    }

    const status = result.status === 'failed' ? 500 : result.status === 'unavailable' ? 503 : 202

    return NextResponse.json({ result }, { status })
  } catch (err) {
    console.error('[integrations/intent]', err)
    return NextResponse.json({ error: 'Integration intent failed' }, { status: 500 })
  }
}
