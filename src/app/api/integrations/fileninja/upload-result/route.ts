import { NextResponse } from 'next/server'
import { getFileNinjaStatus } from '@/lib/integrations/config'
import {
  readFileNinjaMessageState,
  withUploadStatus,
  type FileNinjaUploadStatus,
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
    const status = body.status === 'uploaded' || body.status === 'upload_failed'
      ? body.status as Extract<FileNinjaUploadStatus, 'uploaded' | 'upload_failed'>
      : null

    if (!chatId || !messageId || !status) {
      return NextResponse.json({ error: 'Invalid upload result request' }, { status: 400 })
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
    if (!state || !['uploading', 'upload_failed'].includes(state.status)) {
      return NextResponse.json({ error: 'FileNinja message is not awaiting upload result' }, { status: 409 })
    }

    const providerStatus = getFileNinjaStatus()

    if (!providerStatus.enabled) {
      return NextResponse.json({ error: 'FileNinja provider is disabled.' }, { status: 503 })
    }

    if (!providerStatus.configured) {
      return NextResponse.json({ error: providerStatus.reason ?? 'FileNinja provider is not configured.' }, { status: 503 })
    }

    const now = new Date().toISOString()
    const nextMetadata = status === 'uploaded'
      ? withUploadStatus(state.metadata, 'uploaded', {
          completedAt: now,
          lastError: null,
        })
      : withUploadStatus(state.metadata, 'upload_failed', {
          failedAt: now,
          lastError: typeof body.error === 'string' ? body.error.slice(0, 240) : 'upload_failed',
        })

    const { data: updated, error: updateError } = await supabase
      .from('messages')
      .update({ metadata: nextMetadata })
      .eq('id', messageId)
      .eq('sender_id', user.id)
      .select('id, metadata')
      .single()

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Unable to update message upload result' }, { status: 500 })
    }

    return NextResponse.json({
      message: {
        id: updated.id,
        status,
      },
    })
  } catch (err) {
    console.error('[integrations/fileninja/upload-result]', err)
    return NextResponse.json({ error: 'FileNinja upload result update failed' }, { status: 500 })
  }
}
