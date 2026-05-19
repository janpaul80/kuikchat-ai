import type { IntegrationProviderStatus } from './types'

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0)
}

export interface FileNinjaConfig {
  apiUrl?: string
  apiKey?: string
}

export interface RevProConfig {
  apiUrl?: string
  apiKey?: string
}

export function getFileNinjaConfig(): FileNinjaConfig {
  return {
    apiUrl: process.env.FILENINJA_API_URL,
    apiKey: process.env.FILENINJA_API_KEY,
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

  return {
    provider: 'fileninja',
    configured,
    status: configured ? 'available' : 'unconfigured',
    reason: configured ? undefined : 'Set FILENINJA_API_URL and FILENINJA_API_KEY to enable FileNinja.',
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
