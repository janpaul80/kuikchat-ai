import { NextResponse } from 'next/server'
import { getFileNinjaStatus } from '@/lib/integrations/config'
import { createFileNinjaClient, FileNinjaClientError } from '@/lib/integrations/fileninja/client'
import {
  canCompleteTransfer,
  readFileNinjaMessageState,
  withUploadStatus,
} from '@/lib/integrations/fileninja/message-state'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function hasForbiddenDeliveryValue(value: unknown): boolean {
  if (typeof value === 'string') {
    return /signedUploadUrl|signedDownloadUrl|storageKey|service_role|\/storage\/v1\/object\/public\//i.test(value)
  }

  if (Array.isArray(value)) return value.some(hasForbiddenDeliveryValue)
  if (!value || typeof value !== 'object') return false

  return Object.entries(value as Record<string, unknown>).some(([key, nested]) => {
    if (/signedUploadUrl|signedDownloadUrl|uploadToken|serviceRole|storageKey/i.test(key)) return true
    return hasForbiddenDeliveryValue(nested)
  })
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
    const chatId = typeof body.chatId === 'string' ? body.chatId : ''
    const messageId = typeof body.messageId === 'string' ? body.messageId : ''

    if (!chatId || !messageId) {
      return NextResponse.json({ error: 'Invalid complete request' }, { status: 400 })
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

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, chat_id, sender_id, type, metadata')
      .eq('id', messageId)
      .maybeSingle()

    if (messageError) {
      return NextResponse.json({ error: 'Unable to load message' }, { status: 500 })
    }

    if (!message || message.chat_id !== chatId || message.type !== 'file') {
      return NextResponse.json({ error: 'Invalid FileNinja message' }, { status: 404 })
    }

    if (message.sender_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const state = readFileNinjaMessageState(message.metadata)
    if (!state || !canCompleteTransfer(state.status)) {
      return NextResponse.json({ error: 'FileNinja message is not ready to complete' }, { status: 409 })
    }

    const providerStatus = getFileNinjaStatus()

    if (!providerStatus.enabled) {
      return NextResponse.json({ error: 'FileNinja provider is disabled.' }, { status: 503 })
    }

    if (!providerStatus.configured) {
      return NextResponse.json({ error: providerStatus.reason ?? 'FileNinja provider is not configured.' }, { status: 503 })
    }

    const completingMetadata = withUploadStatus(state.metadata, 'completing', {
      completeRequestedAt: new Date().toISOString(),
      lastError: null,
    })

    const { error: completingError } = await supabase
      .from('messages')
      .update({ metadata: completingMetadata })
      .eq('id', messageId)
      .eq('sender_id', user.id)

    if (completingError) {
      return NextResponse.json({ error: 'Unable to update message complete status' }, { status: 500 })
    }

    try {
      const completed = await createFileNinjaClient().completeTransfer(state.transferId)
      const completedAt = completed.completedAt ?? new Date().toISOString()
      const providerData = state.metadata.fileninja && typeof state.metadata.fileninja === 'object'
        ? { ...(state.metadata.fileninja as Record<string, unknown>) }
        : {}

      const readyMetadata = {
        ...completingMetadata,
        integrationSlice: 'FN-KC-4',
        status: 'ready',
        uploadEnabled: false,
        deliveryEnabled: true,
        fileninja: {
          ...providerData,
          publicUrl: completed.publicUrl,
          completedAt,
        },
        upload: {
          ...(completingMetadata.upload && typeof completingMetadata.upload === 'object'
            ? completingMetadata.upload as Record<string, unknown>
            : {}),
          completedAt,
          lastError: null,
        },
      }

      if (hasForbiddenDeliveryValue(readyMetadata)) {
        return NextResponse.json({ error: 'Refusing to persist unsafe FileNinja delivery metadata.' }, { status: 500 })
      }

      const { data: updated, error: readyError } = await supabase
        .from('messages')
        .update({ metadata: readyMetadata })
        .eq('id', messageId)
        .eq('sender_id', user.id)
        .select('id, metadata')
        .single()

      if (readyError || !updated) {
        const failedMetadata = withUploadStatus(completingMetadata, 'completed_but_message_update_failed', {
          failedAt: new Date().toISOString(),
          lastError: readyError?.message ?? 'message_update_failed',
        })

        await supabase
          .from('messages')
          .update({ metadata: failedMetadata })
          .eq('id', messageId)
          .eq('sender_id', user.id)

        return NextResponse.json({ error: 'FileNinja transfer completed, but message update failed.' }, { status: 500 })
      }

      return NextResponse.json({
        message: {
          id: updated.id,
          status: 'ready',
        },
        delivery: {
          transferId: completed.transferId,
          shareToken: completed.shareToken,
          publicUrl: completed.publicUrl,
          completedAt,
        },
      })
    } catch (error) {
      const failedMetadata = withUploadStatus(completingMetadata, 'complete_failed', {
        failedAt: new Date().toISOString(),
        lastError: error instanceof FileNinjaClientError ? error.code ?? error.message : 'complete_failed',
      })

      await supabase
        .from('messages')
        .update({ metadata: failedMetadata })
        .eq('id', messageId)
        .eq('sender_id', user.id)

      return NextResponse.json({ error: 'FileNinja transfer completion failed.' }, { status: 502 })
    }
  } catch (err) {
    console.error('[integrations/fileninja/complete]', err)
    return NextResponse.json({ error: 'FileNinja complete request failed' }, { status: 500 })
  }
}
