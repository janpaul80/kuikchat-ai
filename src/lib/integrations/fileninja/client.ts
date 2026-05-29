import 'server-only'

import { getFileNinjaConfig, type FileNinjaConfig } from '../config'

export interface FileNinjaTransferFileInput {
  name: string
  size: number
  contentType?: string | null
}

export interface FileNinjaCreateTransferInput {
  senderEmail?: string | null
  recipientEmail?: string | null
  message?: string | null
  externalReference?: string | null
  files: FileNinjaTransferFileInput[]
}

export interface FileNinjaTransferFile {
  fileId: string
  uploadSessionId?: string
  fileIndex: number
  storageKey?: string
  name: string
  size: number
}

export interface FileNinjaCreateTransferResponse {
  transferId: string
  shareToken: string
  publicUrl: string
  status: string
  files: FileNinjaTransferFile[]
}

export interface FileNinjaCreateUploadUrlResponse {
  transferId: string
  fileId: string
  uploadSessionId?: string
  storageKey: string
  signedUploadUrl: string
  token: string
  expiresIn: number
  maxBytes: number
  contentType?: string | null
}

export interface FileNinjaCompleteTransferResponse {
  transferId: string
  shareToken: string
  publicUrl: string
  status: string
  completedAt?: string
  files?: Array<{
    fileIndex: number
    name: string
    size: number
  }>
}

export interface FileNinjaTransferStatusResponse {
  transferId: string
  status: string
  files?: FileNinjaTransferFile[]
}

export class FileNinjaClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string
  ) {
    super(message)
    this.name = 'FileNinjaClientError'
  }
}

export class FileNinjaClient {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(config: FileNinjaConfig = getFileNinjaConfig()) {
    if (!config.enabled) {
      throw new FileNinjaClientError('FileNinja provider is disabled.')
    }

    if (!config.apiUrl || !config.apiKey) {
      throw new FileNinjaClientError('FileNinja provider is not configured.')
    }

    this.baseUrl = config.apiUrl.replace(/\/$/, '')
    this.apiKey = config.apiKey
  }

  createTransfer(input: FileNinjaCreateTransferInput) {
    return this.request<FileNinjaCreateTransferResponse>('/api/transfers', {
      method: 'POST',
      body: input,
    })
  }

  createUploadUrl(transferId: string, fileId: string) {
    return this.request<FileNinjaCreateUploadUrlResponse>(
      `/api/transfers/${encodeURIComponent(transferId)}/upload-url`,
      {
        method: 'POST',
        body: { fileId },
      }
    )
  }

  completeTransfer(transferId: string) {
    return this.request<FileNinjaCompleteTransferResponse>(
      `/api/transfers/${encodeURIComponent(transferId)}/complete`,
      {
        method: 'POST',
      }
    )
  }

  getTransferStatus(transferId: string) {
    return this.request<FileNinjaTransferStatusResponse>(
      `/api/internal/transfers/${encodeURIComponent(transferId)}/status`,
      {
        method: 'GET',
      }
    )
  }

  private async request<T>(
    path: string,
    init: {
      method: 'GET' | 'POST'
      body?: unknown
    }
  ): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: init.method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-KuikChat-Integration': 'fileninja',
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        cache: 'no-store',
        signal: controller.signal,
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const code = typeof payload?.error === 'string' ? payload.error : undefined
        throw new FileNinjaClientError('FileNinja request failed.', response.status, code)
      }

      return payload as T
    } catch (error) {
      if (error instanceof FileNinjaClientError) throw error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FileNinjaClientError('FileNinja request timed out.')
      }
      throw new FileNinjaClientError('FileNinja request failed.')
    } finally {
      clearTimeout(timeout)
    }
  }
}

export function createFileNinjaClient(config?: FileNinjaConfig) {
  return new FileNinjaClient(config)
}
