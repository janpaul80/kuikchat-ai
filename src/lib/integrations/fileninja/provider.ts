import { getFileNinjaStatus } from '../config'
import type { FileTransferIntent, FileTransferProvider, IntegrationResult } from '../types'

export const fileNinjaProvider: FileTransferProvider = {
  id: 'fileninja',
  displayName: 'FileNinja',

  getStatus() {
    return getFileNinjaStatus()
  },

  async createTransfer(intent: FileTransferIntent): Promise<IntegrationResult> {
    const status = getFileNinjaStatus()

    if (!status.configured) {
      return {
        provider: 'fileninja',
        kind: intent.kind,
        status: 'unavailable',
        message: status.reason ?? 'FileNinja is not configured.',
      }
    }

    return {
      provider: 'fileninja',
      kind: intent.kind,
      status: 'unavailable',
      message: 'FileNinja provider is configured, but secure transfer creation is not implemented in Slice 1.',
      metadata: {
        chatId: intent.chatId,
        fileName: intent.fileName,
        fileSize: intent.fileSize,
        mimeType: intent.mimeType,
      },
    }
  },
}
