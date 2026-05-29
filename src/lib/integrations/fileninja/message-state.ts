export type FileNinjaUploadStatus =
  | 'transfer_created'
  | 'requesting_upload_url'
  | 'uploading'
  | 'upload_url_failed'
  | 'upload_failed'
  | 'uploaded'
  | 'completing'
  | 'complete_failed'
  | 'completed_but_message_update_failed'
  | 'ready'

export interface FileNinjaMessageMetadata {
  provider?: unknown
  integrationSlice?: unknown
  status?: unknown
  uploadEnabled?: unknown
  deliveryEnabled?: unknown
  file?: unknown
  fileninja?: unknown
  upload?: unknown
}

export interface FileNinjaMessageState {
  metadata: FileNinjaMessageMetadata
  status: FileNinjaUploadStatus
  transferId: string
  fileId: string
}

const UPLOAD_URL_ALLOWED_STATUSES = new Set<FileNinjaUploadStatus>([
  'transfer_created',
  'requesting_upload_url',
  'uploading',
  'upload_url_failed',
  'upload_failed',
])

const COMPLETE_ALLOWED_STATUSES = new Set<FileNinjaUploadStatus>([
  'uploaded',
  'complete_failed',
])

export function readFileNinjaMessageState(value: unknown): FileNinjaMessageState | null {
  if (!value || typeof value !== 'object') return null

  const metadata = value as FileNinjaMessageMetadata
  if (metadata.provider !== 'fileninja') return null

  const status = metadata.status
  if (typeof status !== 'string') return null

  const providerData = metadata.fileninja
  if (!providerData || typeof providerData !== 'object') return null

  const transferId = (providerData as Record<string, unknown>).transferId
  const fileId = (providerData as Record<string, unknown>).fileId

  if (typeof transferId !== 'string' || !transferId) return null
  if (typeof fileId !== 'string' || !fileId) return null

  return {
    metadata,
    status: status as FileNinjaUploadStatus,
    transferId,
    fileId,
  }
}

export function canRequestUploadUrl(status: FileNinjaUploadStatus) {
  return UPLOAD_URL_ALLOWED_STATUSES.has(status)
}

export function canCompleteTransfer(status: FileNinjaUploadStatus) {
  return COMPLETE_ALLOWED_STATUSES.has(status)
}

export function withUploadStatus(
  metadata: FileNinjaMessageMetadata,
  status: FileNinjaUploadStatus,
  patch: Record<string, unknown> = {}
) {
  const upload = metadata.upload && typeof metadata.upload === 'object'
    ? { ...(metadata.upload as Record<string, unknown>) }
    : {}

  return {
    ...metadata,
    status,
    upload: {
      ...upload,
      ...patch,
    },
  }
}
