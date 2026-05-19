import { createBrowserClient } from '@supabase/ssr'

/**
 * Supported intent types for the KuikChat Ecosystem.
 * This architecture allows the ChatInputArea to blindly dispatch intents,
 * while this service routes them to the correct backend integration
 * (FileNinja, Rev-Pro, Hermes, or standard Supabase Storage).
 */
export type ChatIntentType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'document'  // Future: routes to FileNinja for large files
  | 'location'
  | 'poll'
  | 'contact'
  | 'event'
  | 'ai_action' // Future: routes to Hermes / Rev-Pro

export interface ChatIntentPayload {
  type: ChatIntentType
  file?: File
  text?: string
  metadata?: Record<string, any>
}

/**
 * Maps a ChatIntentType to the correct Supabase Storage bucket.
 * Buckets are defined in 009_storage_buckets.sql.
 *
 * Future routing hooks:
 *   - 'document' with file.size > 50MB → FileNinja API
 *   - 'ai_action' → Hermes / Rev-Pro API
 */
function resolveBucket(type: ChatIntentType): string {
  switch (type) {
    case 'voice':
    case 'audio':
      return 'voice'
    case 'image':
    case 'video':
      return 'attachments'
    case 'document':
      // --- FileNinja Hook (Future) ---
      // if (file.size > 50_000_000) return fileNinjaService.upload(file)
      return 'attachments'
    default:
      return 'attachments'
  }
}

/**
 * Processes a chat media intent and uploads the file to the correct bucket.
 * Returns the public URL on success.
 */
export async function processChatIntent(
  chatId: string,
  payload: ChatIntentPayload,
  supabase: ReturnType<typeof createBrowserClient>
): Promise<{ url?: string; error?: Error }> {

  if (!payload.file) return { error: new Error('No file provided') }

  const bucket = resolveBucket(payload.type)
  const fileExt = payload.file.name.split('.').pop() ?? 'bin'
  // Path structure: {chatId}/{timestamp}-{random}.{ext}
  const fileName = `${chatId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, payload.file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Voice and attachments are private — use signed URLs (1 hour expiry)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileName, 3600)

    if (signedError) throw signedError

    return { url: signedData.signedUrl }
  } catch (error: any) {
    console.error('[media-service] Upload failed:', error)
    return { error }
  }
}
