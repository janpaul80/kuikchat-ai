import { NextResponse } from 'next/server'
import { getFileNinjaStatus } from '@/lib/integrations/config'
import { createFileNinjaClient, FileNinjaClientError } from '@/lib/integrations/fileninja/client'
import {
  canRequestUploadUrl,
  readFileNinjaMessageState,
  withUploadStatus,
} from '@/lib/integrations/fileninja/message-state'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
      return NextResponse.json({ error: 'Invalid upload URL request' }, { status: 400 })
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
    if (!state || !canRequestUploadUrl(state.status)) {
      return NextResponse.json({ error: 'FileNinja message is not uploadable' }, { status: 409 })
    }

    const providerStatus = getFileNinjaStatus()

    if (!providerStatus.enabled) {
      return NextResponse.json({ error: 'FileNinja provider is disabled.' }, { status: 503 })
    }

    if (!providerStatus.configured) {
      return NextResponse.json({ error: providerStatus.reason ?? 'FileNinja provider is not configured.' }, { status: 503 })
    }

    const now = new Date().toISOString()
    const currentUpload = state.metadata.upload && typeof state.metadata.upload === 'object'
      ? state.metadata.upload as Record<string, unknown>
      : {}
    const attemptCount = Number(currentUpload.attemptCount || 0) + 1

    const requestingMetadata = withUploadStatus(state.metadata, 'requesting_upload_url', {
      startedAt: currentUpload.startedAt || now,
      uploadUrlRequestedAt: now,
      attemptCount,
      lastError: null,
    })

    const { error: requestingError } = await supabase
      .from('messages')
      .update({ metadata: requestingMetadata })
      .eq('id', messageId)
      .eq('sender_id', user.id)

    if (requestingError) {
      return NextResponse.json({ error: 'Unable to update message upload status' }, { status: 500 })
    }

    try {
      const upload = await createFileNinjaClient().createUploadUrl(state.transferId, state.fileId)
      const uploadingMetadata = withUploadStatus(requestingMetadata, 'uploading', {
        uploadUrlGrantedAt: new Date().toISOString(),
        lastError: null,
      })

      const { error: uploadingError } = await supabase
        .from('messages')
        .update({ metadata: uploadingMetadata })
        .eq('id', messageId)
        .eq('sender_id', user.id)

      if (uploadingError) {
        return NextResponse.json({ error: 'Unable to update message upload status' }, { status: 500 })
      }

      return NextResponse.json({
        upload: {
          transferId: upload.transferId,
          fileId: upload.fileId,
          uploadSessionId: upload.uploadSessionId,
          storageKey: upload.storageKey,
          signedUploadUrl: upload.signedUploadUrl,
          token: upload.token,
          expiresIn: upload.expiresIn,
          maxBytes: upload.maxBytes,
          contentType: upload.contentType ?? null,
        },
        message: {
          id: messageId,
          status: 'uploading',
        },
      })
    } catch (error) {
      const failedMetadata = withUploadStatus(requestingMetadata, 'upload_url_failed', {
        failedAt: new Date().toISOString(),
        lastError: error instanceof FileNinjaClientError ? error.code ?? error.message : 'upload_url_failed',
      })

      await supabase
        .from('messages')
        .update({ metadata: failedMetadata })
        .eq('id', messageId)
        .eq('sender_id', user.id)

      return NextResponse.json({ error: 'FileNinja signed upload URL request failed.' }, { status: 502 })
    }
  } catch (err) {
    console.error('[integrations/fileninja/upload-url]', err)
    return NextResponse.json({ error: 'FileNinja upload URL request failed' }, { status: 500 })
  }
}
