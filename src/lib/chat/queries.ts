'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ChatListItem,
  MessageRow,
  ProfileLite,
  ReactionRow,
  ReadRow,
  RepliedToPreview,
} from './types'

/**
 * Fetch the chat list for the current user.
 * Returns chats they are a member of, joined with the "other" member's
 * profile (for direct chats) and the most recent message.
 */
export async function fetchChatList(
  supabase: SupabaseClient,
  userId: string
): Promise<ChatListItem[]> {
  // 1. Get all chat memberships for this user
  const { data: memberships, error: memberErr } = await supabase
    .from('chat_members')
    .select(
      `
      chat_id,
      is_pinned,
      is_muted,
      unread_count,
      last_read_at,
      chat:chats (
        id, type, name, description, avatar_url, created_by,
        last_message_at, created_at, updated_at
      )
    `
    )
    .eq('user_id', userId)
    .eq('is_archived', false)

  if (memberErr) throw memberErr
  if (!memberships || memberships.length === 0) return []

  const chatIds = memberships.map((m: any) => m.chat_id)

  // 2. For direct chats, fetch the "other" member's profile
  const { data: otherMembers } = await supabase
    .from('chat_members')
    .select(
      `
      chat_id,
      user_id,
      profile:profiles (id, username, display_name, avatar_url, plan)
    `
    )
    .in('chat_id', chatIds)
    .neq('user_id', userId)

  const otherByChatId = new Map<string, ProfileLite>()
  for (const om of otherMembers || []) {
    if (!otherByChatId.has((om as any).chat_id) && (om as any).profile) {
      otherByChatId.set((om as any).chat_id, (om as any).profile as ProfileLite)
    }
  }

  // 3. Fetch the latest message for each chat in one query, then bucket client-side.
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('id, chat_id, sender_id, type, body, created_at, deleted_for_everyone')
    .in('chat_id', chatIds)
    .order('created_at', { ascending: false })
    .limit(chatIds.length * 5) // small buffer; we just take the first per chat

  const lastMsgByChat = new Map<string, MessageRow>()
  for (const m of (recentMessages || []) as MessageRow[]) {
    if (!lastMsgByChat.has(m.chat_id)) lastMsgByChat.set(m.chat_id, m)
  }

  // 4. Compose ChatListItem[]
  const items: ChatListItem[] = memberships.map((m: any) => {
    const chat = m.chat
    const other = otherByChatId.get(m.chat_id) || null
    const isDirect = chat?.type === 'direct'

    const displayName =
      chat?.name ||
      (isDirect
        ? other?.display_name || other?.username || 'Direct chat'
        : 'Group chat')

    const displayAvatar = chat?.avatar_url || other?.avatar_url || null

    return {
      chat,
      otherMember: other,
      displayName,
      displayAvatar,
      lastMessage: lastMsgByChat.get(m.chat_id) || null,
      isPinned: !!m.is_pinned,
      isMuted: !!m.is_muted,
      unreadCount: m.unread_count || 0,
    }
  })

  // Deduplicate direct chats by other user ID (keep the most recent one)
  const dedupedItems: ChatListItem[] = []
  const directChatSeen = new Set<string>()

  // Sort first so we keep the newest when deduplicating
  items.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    const ta = a.lastMessage?.created_at || a.chat?.last_message_at || a.chat?.created_at || ''
    const tb = b.lastMessage?.created_at || b.chat?.last_message_at || b.chat?.created_at || ''
    return tb.localeCompare(ta)
  })

  for (const item of items) {
    if (item.chat.type === 'direct' && item.otherMember) {
      if (directChatSeen.has(item.otherMember.id)) {
        continue // Skip duplicate direct chat
      }
      directChatSeen.add(item.otherMember.id)
    }
    dedupedItems.push(item)
  }

  return dedupedItems
}

/**
 * Fetch one chat's metadata + the "other" member (for direct chats).
 */
export async function fetchChatMeta(
  supabase: SupabaseClient,
  chatId: string,
  userId: string
): Promise<{ chat: any; other: ProfileLite | null } | null> {
  const { data: chat, error } = await supabase
    .from('chats')
    .select('id, type, name, description, avatar_url')
    .eq('id', chatId)
    .single()

  if (error || !chat) return null

  let other: ProfileLite | null = null
  if (chat.type === 'direct') {
    const { data: otherMember } = await supabase
      .from('chat_members')
      .select('profile:profiles (id, username, display_name, avatar_url, plan)')
      .eq('chat_id', chatId)
      .neq('user_id', userId)
      .limit(1)
      .maybeSingle()
    if (otherMember && (otherMember as any).profile) {
      other = (otherMember as any).profile as ProfileLite
    }
  }

  return { chat, other }
}

/**
 * Cursor-paginated message fetch via the SQL RPC defined in migration 010.
 * Returns messages in DESC order (newest first); UI flips for display.
 */
export async function fetchMessagesPage(
  supabase: SupabaseClient,
  chatId: string,
  before?: string | null,
  limit = 30
): Promise<MessageRow[]> {
  const { data, error } = await supabase.rpc('get_chat_messages_page', {
    p_chat_id: chatId,
    p_before: before ?? null,
    p_limit: limit,
  })
  if (error) throw error
  return (data || []) as MessageRow[]
}

/**
 * Insert a new text message.
 */
export async function sendTextMessage(
  supabase: SupabaseClient,
  chatId: string,
  senderId: string,
  body: string,
  replyToId?: string | null
): Promise<MessageRow> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      type: 'text',
      body,
      reply_to_id: replyToId ?? null,
    })
    .select(
      'id, chat_id, sender_id, type, body, reply_to_id, edited_at, deleted_at, deleted_for_everyone, created_at'
    )
    .single()

  if (error) throw error
  return data as MessageRow
}

/**
 * Insert a new poll message and poll data.
 */
export async function createPoll(
  supabase: SupabaseClient,
  chatId: string,
  senderId: string,
  pollData: {
    question: string
    options: { id: string; text: string }[]
    isMultiple: boolean
    isAnonymous: boolean
    closesAt: string | null
  }
): Promise<MessageRow> {
  // Insert the poll message first
  const { data: msgData, error: msgError } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      type: 'poll',
      body: '📊 Poll: ' + pollData.question,
    })
    .select(
      'id, chat_id, sender_id, type, body, reply_to_id, edited_at, deleted_at, deleted_for_everyone, created_at'
    )
    .single()

  if (msgError) throw msgError

  const messageId = msgData.id

  // Then create the poll
  const { error: pollError } = await supabase
    .from('polls')
    .insert({
      chat_id: chatId,
      message_id: messageId,
      question: pollData.question,
      options: pollData.options,
      is_multiple: pollData.isMultiple,
      is_anonymous: pollData.isAnonymous,
      closes_at: pollData.closesAt,
      created_by: senderId,
    })

  if (pollError) {
    // Attempt rollback
    await supabase.rpc('delete_message_for_everyone', { p_message_id: messageId })
    throw pollError
  }

  return msgData as MessageRow
}

/**
 * Fetch contacts for the current user.
 * Joins with profiles to get display names and avatars.
 */
export async function fetchContacts(
  supabase: SupabaseClient,
  userId: string
): Promise<(ProfileLite & { nickname: string | null; is_favorite: boolean })[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      nickname,
      is_favorite,
      profile:profiles!contact_id (id, username, display_name, avatar_url)
    `)
    .eq('user_id', userId)

  if (error) throw error

  return (data || []).map((c: any) => ({
    ...c.profile,
    nickname: c.nickname,
    is_favorite: c.is_favorite,
  }))
}

// ─── Slice B: mutations ──────────────────────────────────────────────────────

/**
 * Edit a message body. Server enforces: sender-only, <15 min, not deleted.
 * Returns the updated MessageRow.
 */
export async function editMessage(
  supabase: SupabaseClient,
  messageId: string,
  newBody: string
): Promise<MessageRow> {
  const { data, error } = await supabase.rpc('edit_message', {
    p_message_id: messageId,
    p_new_body: newBody,
  })
  if (error) throw error
  // RPC returns a TABLE-shaped row; normalize to first element.
  const row = Array.isArray(data) ? data[0] : data
  return row as MessageRow
}

/**
 * Hide message from the current user's view only. Idempotent.
 */
export async function deleteMessageForMe(
  supabase: SupabaseClient,
  messageId: string
): Promise<void> {
  const { error } = await supabase.rpc('delete_message_for_me', {
    p_message_id: messageId,
  })
  if (error) throw error
}

/**
 * Tombstone a message for all chat members (sender or admin only).
 */
export async function deleteMessageForEveryone(
  supabase: SupabaseClient,
  messageId: string
): Promise<MessageRow> {
  const { data, error } = await supabase.rpc('delete_message_for_everyone', {
    p_message_id: messageId,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return row as MessageRow
}

// ─── Slice B: reactions ──────────────────────────────────────────────────────

/**
 * Toggle a reaction on a message. Server returns 'added' | 'removed'.
 */
export async function toggleReaction(
  supabase: SupabaseClient,
  messageId: string,
  emoji: string
): Promise<'added' | 'removed'> {
  const { data, error } = await supabase.rpc('toggle_message_reaction', {
    p_message_id: messageId,
    p_emoji: emoji,
  })
  if (error) throw error
  return (data as 'added' | 'removed') || 'added'
}

/**
 * Fetch all reactions for a batch of messages in one round trip.
 */
export async function fetchReactionsBulk(
  supabase: SupabaseClient,
  messageIds: string[]
): Promise<ReactionRow[]> {
  if (messageIds.length === 0) return []
  const { data, error } = await supabase
    .from('message_reactions')
    .select('id, message_id, user_id, emoji, created_at')
    .in('message_id', messageIds)
  if (error) throw error
  return (data || []) as ReactionRow[]
}

// ─── Slice B: read receipts ──────────────────────────────────────────────────

/**
 * Mark every unread message in a chat as read by the current user.
 * Returns the number of new receipts inserted.
 */
export async function markChatAsRead(
  supabase: SupabaseClient,
  chatId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('mark_chat_as_read', {
    p_chat_id: chatId,
  })
  if (error) throw error
  return (data as number) ?? 0
}

/**
 * Fetch all read receipts for a batch of messages.
 * Used to render blue ticks on the sender's own messages.
 */
export async function fetchReadsBulk(
  supabase: SupabaseClient,
  messageIds: string[]
): Promise<ReadRow[]> {
  if (messageIds.length === 0) return []
  const { data, error } = await supabase
    .from('message_reads')
    .select('id, message_id, user_id, read_at')
    .in('message_id', messageIds)
  if (error) throw error
  return (data || []) as ReadRow[]
}

// ─── Slice B: reply previews ─────────────────────────────────────────────────

/**
 * Fetch small previews of the messages being replied-to, so we can render
 * a quoted snippet inside each bubble.
 */
export async function fetchRepliedToBatch(
  supabase: SupabaseClient,
  messageIds: string[]
): Promise<Map<string, RepliedToPreview>> {
  const map = new Map<string, RepliedToPreview>()
  if (messageIds.length === 0) return map
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, body, deleted_for_everyone')
    .in('id', messageIds)
  if (error) throw error
  for (const row of (data || []) as RepliedToPreview[]) {
    map.set(row.id, row)
  }
  return map
}
