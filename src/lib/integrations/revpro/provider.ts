import { getRevProStatus } from '../config'
import type { IntegrationResult, MediaIntelligenceIntent, MediaIntelligenceProvider } from '../types'

export const revProProvider: MediaIntelligenceProvider = {
  id: 'revpro',
  displayName: 'Rev-Pro',

  getStatus() {
    return getRevProStatus()
  },

  async createMediaJob(intent: MediaIntelligenceIntent): Promise<IntegrationResult> {
    const status = getRevProStatus()

    if (!status.configured) {
      return {
        provider: 'revpro',
        kind: intent.kind,
        status: 'unavailable',
        message: status.reason ?? 'Rev-Pro is not configured.',
      }
    }

    return {
      provider: 'revpro',
      kind: intent.kind,
      status: 'unavailable',
      message: 'Rev-Pro provider is configured, but media intelligence jobs are not implemented in Slice 1.',
      metadata: {
        chatId: intent.chatId,
        sourceUrl: intent.sourceUrl,
        sourceMessageId: intent.sourceMessageId,
        fileName: intent.fileName,
      },
    }
  },
}
