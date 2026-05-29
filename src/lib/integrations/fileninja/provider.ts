import { getFileNinjaStatus } from '../config'
import { createFileNinjaClient, FileNinjaClientError } from './client'
import { randomUUID } from 'crypto'
import type {
  FileTransferIntent,
  FileTransferProvider,
  IntegrationResult,
  PendingIntegrationMessage,
} from '../types'

const FN_KC_2_SLICE = 'FN-KC-2'
const MAX_FILE_NAME_LENGTH = 255

function safeFileName(value: string | undefined) {
  return value?.trim().slice(0, MAX_FILE_NAME_LENGTH) || ''
}

function metadataString(intent: FileTransferIntent, key: string) {
  const value = intent.metadata?.[key]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function firstFile(result: IntegrationResult) {
  const files = result.metadata?.files
  return Array.isArray(files) ? files[0] as Record<string, unknown> | undefined : undefined
}

export const fileNinjaProvider: FileTransferProvider = {
  id: 'fileninja',
  displayName: 'FileNinja',

  getStatus() {
    return getFileNinjaStatus()
  },

  validateTransferIntent(intent: FileTransferIntent) {
    const fileName = safeFileName(intent.fileName)
    const fileSize = intent.fileSize

    if (!fileName) return 'File name is required.'
    if (typeof fileSize !== 'number' || !Number.isFinite(fileSize) || fileSize <= 0) {
      return 'File size must be a positive number.'
    }

    return null
  },

  async createTransfer(intent: FileTransferIntent): Promise<IntegrationResult> {
    const status = getFileNinjaStatus()

    if (!status.enabled) {
      return {
        provider: 'fileninja',
        kind: intent.kind,
        status: 'unavailable',
        message: 'FileNinja provider is disabled.',
        metadata: {
          integrationSlice: FN_KC_2_SLICE,
          uploadEnabled: false,
        },
      }
    }

    if (!status.configured) {
      return {
        provider: 'fileninja',
        kind: intent.kind,
        status: 'unavailable',
        message: status.reason ?? 'FileNinja is not configured.',
      }
    }

    const validationError = this.validateTransferIntent(intent)
    if (validationError) {
      return {
        provider: 'fileninja',
        kind: intent.kind,
        status: 'failed',
        message: validationError,
      }
    }

    try {
      const client = createFileNinjaClient()
      const fileName = safeFileName(intent.fileName)
      const transfer = await client.createTransfer({
        senderEmail: metadataString(intent, 'senderEmail') ?? null,
        recipientEmail: null,
        message: metadataString(intent, 'message') ?? 'KuikChat secure file transfer',
        externalReference: metadataString(intent, 'externalReference') ?? `kuikchat:${intent.chatId}`,
        files: [
          {
            name: fileName,
            size: intent.fileSize!,
            contentType: intent.mimeType || null,
          },
        ],
      })

      return {
        provider: 'fileninja',
        kind: intent.kind,
        status: 'accepted',
        message: 'FileNinja transfer created.',
        metadata: {
          integrationSlice: FN_KC_2_SLICE,
          uploadEnabled: false,
          deliveryEnabled: false,
          chatId: intent.chatId,
          transferId: transfer.transferId,
          shareToken: transfer.shareToken,
          publicUrl: transfer.publicUrl,
          status: transfer.status,
          files: transfer.files.map((file) => ({
            fileId: file.fileId,
            uploadSessionId: file.uploadSessionId,
            fileIndex: file.fileIndex,
            name: file.name,
            size: file.size,
          })),
        },
      }
    } catch (error) {
      const code = error instanceof FileNinjaClientError ? error.code : undefined
      const providerStatus = error instanceof FileNinjaClientError ? error.status : undefined

      return {
        provider: 'fileninja',
        kind: intent.kind,
        status: 'failed',
        message: 'FileNinja transfer creation failed.',
        metadata: {
          integrationSlice: FN_KC_2_SLICE,
          code,
          providerStatus,
        },
      }
    }
  },

  buildPendingMessage(intent: FileTransferIntent, result: IntegrationResult): PendingIntegrationMessage {
    const fileName = safeFileName(intent.fileName)
    const file = firstFile(result)
    const transferId = typeof result.metadata?.transferId === 'string' ? result.metadata.transferId : null
    const shareToken = typeof result.metadata?.shareToken === 'string' ? result.metadata.shareToken : null
    const publicUrl = typeof result.metadata?.publicUrl === 'string' ? result.metadata.publicUrl : null
    const fileId = typeof file?.fileId === 'string' ? file.fileId : null
    const uploadSessionId = typeof file?.uploadSessionId === 'string' ? file.uploadSessionId : null
    const messageId =
      metadataString(intent, 'pendingMessageId') ??
      randomUUID()

    return {
      id: messageId,
      chatId: intent.chatId,
      type: 'file',
      body: `Secure file pending: ${fileName}`,
      metadata: {
        provider: 'fileninja',
        integrationSlice: FN_KC_2_SLICE,
        status: 'transfer_created',
        uploadEnabled: false,
        deliveryEnabled: false,
        file: {
          name: fileName,
          size: intent.fileSize,
          mimeType: intent.mimeType || null,
        },
        fileninja: {
          transferId,
          shareToken,
          fileId,
          uploadSessionId,
          publicUrl,
        },
      },
    }
  },
}
