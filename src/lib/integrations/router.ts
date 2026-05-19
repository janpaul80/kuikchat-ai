import { fileNinjaProvider } from './fileninja/provider'
import { revProProvider } from './revpro/provider'
import type { IntegrationIntent, IntegrationResult } from './types'

export async function routeIntegrationIntent(intent: IntegrationIntent): Promise<IntegrationResult> {
  switch (intent.provider) {
    case 'fileninja':
      return fileNinjaProvider.createTransfer(intent)
    case 'revpro':
      return revProProvider.createMediaJob(intent)
  }
}
