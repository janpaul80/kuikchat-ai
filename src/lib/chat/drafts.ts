/**
 * Per-chat draft persistence using localStorage.
 *
 * Stores one object per chatId: { body, replyToId, updatedAt }
 * Safe to import from client components; all ops are guarded for SSR.
 */

const PREFIX = 'kuikchat.draft.v1.'
// Cap so drafts don't silently bloat storage
const MAX_BODY_LENGTH = 10_000

export interface Draft {
  body: string
  replyToId: string | null
  updatedAt: number
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function keyFor(chatId: string) {
  return `${PREFIX}${chatId}`
}

export function loadDraft(chatId: string): Draft | null {
  if (!isBrowser() || !chatId) return null
  try {
    const raw = window.localStorage.getItem(keyFor(chatId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    return {
      body: typeof parsed.body === 'string' ? parsed.body : '',
      replyToId: typeof parsed.replyToId === 'string' ? parsed.replyToId : null,
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    }
  } catch {
    return null
  }
}

export function saveDraft(
  chatId: string,
  body: string,
  replyToId: string | null
): void {
  if (!isBrowser() || !chatId) return
  try {
    const trimmed = (body ?? '').slice(0, MAX_BODY_LENGTH)
    // Empty draft with no reply: clear instead of storing a blank
    if (!trimmed && !replyToId) {
      window.localStorage.removeItem(keyFor(chatId))
      return
    }
    const payload: Draft = {
      body: trimmed,
      replyToId: replyToId ?? null,
      updatedAt: Date.now(),
    }
    window.localStorage.setItem(keyFor(chatId), JSON.stringify(payload))
  } catch {
    // Quota exceeded / blocked storage - silently ignore.
  }
}

export function clearDraft(chatId: string): void {
  if (!isBrowser() || !chatId) return
  try {
    window.localStorage.removeItem(keyFor(chatId))
  } catch {
    /* noop */
  }
}
