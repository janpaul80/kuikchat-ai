import type { IntegrationProviderStatus } from './types'

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0)
}

function readBoolean(value: string | undefined, fallback = false) {
  if (!hasValue(value)) return fallback
  return ['1', 'true', 'yes', 'on'].includes(value!.trim().toLowerCase())
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  if (!hasValue(value)) return fallback
  const parsed = Number.parseInt(value!.trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export interface FileNinjaConfig {
  enabled: boolean
  apiUrl?: string
  apiKey?: string
  maxInlineBytes: number
}

export interface RevProConfig {
  apiUrl?: string
  apiKey?: string
}

export function getFileNinjaConfig(): FileNinjaConfig {
  return {
    enabled: readBoolean(process.env.FILENINJA_PROVIDER_ENABLED, false),
    apiUrl: process.env.FILENINJA_API_URL,
    apiKey: process.env.FILENINJA_API_KEY,
    maxInlineBytes: readPositiveInteger(process.env.FILENINJA_MAX_INLINE_BYTES, 50 * 1024 * 1024),
  }
}

export function getRevProConfig(): RevProConfig {
  return {
    apiUrl: process.env.REVPRO_API_URL,
    apiKey: process.env.REVPRO_API_KEY,
  }
}

export function getFileNinjaStatus(): IntegrationProviderStatus {
  const config = getFileNinjaConfig()
  const configured = hasValue(config.apiUrl) && hasValue(config.apiKey)

  if (!config.enabled) {
    return {
      provider: 'fileninja',
      configured,
      enabled: false,
      status: 'unavailable',
      reason: 'FileNinja provider is disabled.',
      maxInlineBytes: config.maxInlineBytes,
    }
  }

  return {
    provider: 'fileninja',
    configured,
    enabled: true,
    status: configured ? 'available' : 'unconfigured',
    reason: configured ? undefined : 'Set FILENINJA_API_URL and FILENINJA_API_KEY to enable FileNinja.',
    maxInlineBytes: config.maxInlineBytes,
  }
}

export function getRevProStatus(): IntegrationProviderStatus {
  const config = getRevProConfig()
  const configured = hasValue(config.apiUrl) && hasValue(config.apiKey)

  return {
    provider: 'revpro',
    configured,
    status: configured ? 'available' : 'unconfigured',
    reason: configured ? undefined : 'Set REVPRO_API_URL and REVPRO_API_KEY to enable Rev-Pro.',
  }
}

export function getIntegrationStatuses() {
  return {
    fileninja: getFileNinjaStatus(),
    revpro: getRevProStatus(),
  }
}
