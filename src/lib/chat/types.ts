// Domain types used by the realtime chat slice (Slice A + Slice B).
// Kept minimal & forward-compatible with later slices (media, calls, etc.)

export type ChatType = 'direct' | 'group' | 'hermes' | 'self'

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'file'
  | 'sticker'
  | 'gif'
  | 'location'
  | 'contact'
  | 'poll'
  | 'event'
  | 'call_log'
  | 'system'
  | 'hermes'

export interface ChatRow {
  id: string
  type: ChatType
  name: string | null
  description: string | null
  avatar_url: string | null
  created_by: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface ChatMemberRow {
  id: string
  chat_id: string
  user_id: string
  role: string
  is_pinned: boolean
  is_muted: boolean
  is_archived: boolean
  unread_count: number
  last_read_at: string
  joined_at: string
}

export interface ProfileLite {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

export interface MessageRow {
  id: string
  chat_id: string
  sender_id: string | null
  type: MessageType
  body: string | null
  metadata?: Record<string, any> | null
  reply_to_id: string | null
  edited_at: string | null
  deleted_at: string | null
  deleted_for_everyone: boolean
  created_at: string
}

// Slice B: reactions on a message
export interface ReactionRow {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

// Slice B: per-recipient read receipts
export interface ReadRow {
  id: string
  message_id: string
  user_id: string
  read_at: string
}

// A small view of the message being replied-to, rendered inside the bubble
export interface RepliedToPreview {
  id: string
  sender_id: string | null
  body: string | null
  deleted_for_everyone: boolean
}

// Slice B: polls
export interface PollOption {
  id: string
  text: string
}

export interface PollRow {
  id: string
  chat_id: string
  message_id: string | null
  question: string
  options: PollOption[]
  is_multiple: boolean
  is_anonymous: boolean
  closes_at: string | null
  created_by: string | null
  created_at: string
}

export interface PollVoteRow {
  id: string
  poll_id: string
  user_id: string
  option_id: string
  voted_at: string
}

export interface LiveLocationSessionRow {
  id: string
  message_id: string
  user_id: string
  chat_id: string
  latitude: number
  longitude: number
  is_active: boolean
  expires_at: string
  created_at: string
  updated_at: string
}

export interface EventRow {
  id: string
  message_id: string
  chat_id: string
  title: string
  description: string | null
  location: string | null
  start_time: string
  end_time: string | null
  meeting_link?: string | null
  timezone?: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EventRSVPRow {
  id: string
  event_id: string
  user_id: string
  status: 'going' | 'maybe' | 'declined'
  updated_at: string
}

// Composed view used by the chat list UI
export interface ChatListItem {
  chat: ChatRow
  // For direct chats — the "other" member's profile
  otherMember?: ProfileLite | null
  // Display info derived from chat or otherMember
  displayName: string
  displayAvatar: string | null
  lastMessage: MessageRow | null
  isPinned: boolean
  isMuted: boolean
  unreadCount: number
}

// Slice B helpers ────────────────────────────────────────────────────────────

/** Max window (ms) for sender-side message edits — mirrors migration 011. */
export const EDIT_WINDOW_MS = 15 * 60 * 1000

export function isWithinEditWindow(createdAt: string | Date): boolean {
  const t = typeof createdAt === 'string' ? Date.parse(createdAt) : createdAt.getTime()
  if (!Number.isFinite(t)) return false
  return Date.now() - t < EDIT_WINDOW_MS
}

// Special non-DB chat IDs (kept for the existing Hermes mock chat)
export const HERMES_CHAT_ID = 'hermes'
export function isVirtualChatId(id: string) {
  return id === HERMES_CHAT_ID
}
