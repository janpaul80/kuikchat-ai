export type IntegrationProviderId = 'supabase' | 'fileninja' | 'revpro' | 'hermes'

export type IntegrationIntentKind =
  | 'file.transfer'
  | 'media.transcribe'
  | 'media.summarize'
  | 'media.caption'
  | 'media.notes'

export type IntegrationStatus = 'available' | 'unconfigured' | 'unavailable'

export interface IntegrationProviderStatus {
  provider: IntegrationProviderId
  configured: boolean
  status: IntegrationStatus
  reason?: string
}

export interface IntegrationIntentBase {
  kind: IntegrationIntentKind
  provider: IntegrationProviderId
  chatId: string
  userId: string
  metadata?: Record<string, unknown>
}

export interface FileTransferIntent extends IntegrationIntentBase {
  kind: 'file.transfer'
  provider: 'fileninja'
  fileName?: string
  fileSize?: number
  mimeType?: string
}

export interface MediaIntelligenceIntent extends IntegrationIntentBase {
  kind: 'media.transcribe' | 'media.summarize' | 'media.caption' | 'media.notes'
  provider: 'revpro'
  sourceUrl?: string
  sourceMessageId?: string
  fileName?: string
  mimeType?: string
}

export type IntegrationIntent = FileTransferIntent | MediaIntelligenceIntent

export type IntegrationResultStatus = 'accepted' | 'unavailable' | 'failed'

export interface IntegrationResult {
  provider: IntegrationProviderId
  kind: IntegrationIntentKind
  status: IntegrationResultStatus
  message: string
  metadata?: Record<string, unknown>
}

export interface FileTransferProvider {
  id: 'fileninja'
  displayName: string
  getStatus(): IntegrationProviderStatus
  createTransfer(intent: FileTransferIntent): Promise<IntegrationResult>
}

export interface MediaIntelligenceProvider {
  id: 'revpro'
  displayName: string
  getStatus(): IntegrationProviderStatus
  createMediaJob(intent: MediaIntelligenceIntent): Promise<IntegrationResult>
}
