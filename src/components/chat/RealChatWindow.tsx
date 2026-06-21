'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useAuthUser } from '@/hooks/useAuthUser'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { MessageRow, ReactionRow, ReadRow, RepliedToPreview, ProfileLite } from '@/lib/chat/types'
import {
  fetchMessagesPage,
  fetchChatMeta,
  sendTextMessage,
  editMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
  toggleReaction,
  markChatAsRead,
  fetchReactionsBulk,
  fetchReadsBulk,
  fetchRepliedToBatch,
} from '@/lib/chat/queries'
import { loadDraft, clearDraft } from '@/lib/chat/drafts'
import { processChatIntent } from '@/lib/chat/media-service'
import type { ChatIntentPayload } from '@/lib/chat/media-service'
import { MessageBubble } from './MessageBubble'
import { ReplyPreview } from './ReplyPreview'
import { TypingIndicator } from './TypingIndicator'
import { ChatInputArea } from './input/ChatInputArea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import DayDivider from './DayDivider'
import CommandPalette from './CommandPalette'
import { useCommandPalette } from './useCommandPalette'

const TYPING_TIMEOUT_MS = 3000

export function RealChatWindow({ chatId }: { chatId: string }) {
  const supabase = useMemo(() => createSupabaseClient(), [])
  const { user } = useAuthUser()

  const [messages, setMessages] = useState<MessageRow[]>([])
  const [chatMeta, setChatMeta] = useState<{ chat: any; other: ProfileLite | null } | null>(null)
  const [pendingSends, setPendingSends] = useState<Record<string, MessageRow>>({})
  const [replyTo, setReplyTo] = useState<MessageRow | null>(null)
  const [reactionsByMsg, setReactionsByMsg] = useState<Record<string, ReactionRow[]>>({})
  const [readsByMsg, setReadsByMsg] = useState<Record<string, ReadRow[]>>({})
  const [repliedToMap, setRepliedToMap] = useState<Map<string, RepliedToPreview>>(new Map())
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { open: commandPaletteOpen, setOpen: setCommandPaletteOpen } = useCommandPalette()
  const [filterCommand, setFilterCommand] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const channelRef = useRef<any>(null)
  const markReadRef = useRef<number>(0)

  // Filter messages dynamically on the client
  const filteredMessages = useMemo(() => {
    let list = messages
    if (filterCommand) {
      const now = new Date()
      if (filterCommand === 'today') {
        list = list.filter((m) => new Date(m.created_at).toDateString() === now.toDateString())
      } else if (filterCommand === 'yesterday') {
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        list = list.filter((m) => new Date(m.created_at).toDateString() === yesterday.toDateString())
      } else if (filterCommand === 'lastweek') {
        const lastWeek = new Date(now)
        lastWeek.setDate(now.getDate() - 7)
        list = list.filter((m) => new Date(m.created_at) >= lastWeek)
      } else if (filterCommand === 'files') {
        list = list.filter((m) => m.type === 'file')
      } else if (filterCommand === 'photos') {
        list = list.filter((m) => m.type === 'image' || m.type === 'video')
      } else if (filterCommand === 'links') {
        list = list.filter((m) => m.body?.toLowerCase().includes('http://') || m.body?.toLowerCase().includes('https://'))
      } else if (filterCommand === 'voice') {
        list = list.filter((m) => m.type === 'voice' || (m.body && m.body.includes('🎤 Voice note')))
      } else if (filterCommand === 'polls') {
        list = list.filter((m) => m.type === 'poll')
      } else if (filterCommand === 'events') {
        list = list.filter((m) => m.type === 'event')
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((m) => m.body?.toLowerCase().includes(q))
    }
    return list
  }, [messages, filterCommand, searchQuery])

  const handleRunCommand = (cmd: string) => {
    if (cmd === 'recent') {
      setFilterCommand(null)
      setSearchQuery(null)
    } else {
      setFilterCommand(cmd)
      setSearchQuery(null)
    }
  }

  const handleHermesSearch = (query: string) => {
    setSearchQuery(query)
    setFilterCommand(null)
  }

  // Load initial messages + auxiliary datasets + draft
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!user?.id || !chatId) return
      setLoading(true)
      setError(null)
      try {
        const meta = await fetchChatMeta(supabase, chatId, user.id)
        if (cancelled) return
        setChatMeta(meta)

        const rows = await fetchMessagesPage(supabase, chatId, null, 50)
        if (cancelled) return
        const sorted = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at))
        setMessages(sorted)
        setPendingSends({})

        const messageIds = sorted.map((m) => m.id)
        const [reactions, reads] = await Promise.all([
          fetchReactionsBulk(supabase, messageIds),
          fetchReadsBulk(supabase, messageIds),
        ])
        if (cancelled) return

        const byReaction: Record<string, ReactionRow[]> = {}
        for (const r of reactions) {
          byReaction[r.message_id] = byReaction[r.message_id] || []
          byReaction[r.message_id].push(r)
        }
        setReactionsByMsg(byReaction)

        const byRead: Record<string, ReadRow[]> = {}
        for (const r of reads) {
          byRead[r.message_id] = byRead[r.message_id] || []
          byRead[r.message_id].push(r)
        }
        setReadsByMsg(byRead)

        const replyIds = [...new Set(sorted.map((m) => m.reply_to_id).filter(Boolean) as string[])]
        const replyMap = await fetchRepliedToBatch(supabase, replyIds)
        if (cancelled) return
        setRepliedToMap(replyMap)

        await markChatAsRead(supabase, chatId)

        // Restore replyTo from draft (text body is owned by ChatInputArea)
        const draft = loadDraft(chatId)
        if (draft?.replyToId) {
          const target = sorted.find((m) => m.id === draft.replyToId) || null
          setReplyTo(target)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load chat')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [chatId, supabase, user?.id])

  const upsertMessages = useCallback((rows: MessageRow[]) => {
    setMessages((prev) => {
      const map = new Map<string, MessageRow>()
      // First, add all existing messages to the map
      for (const m of prev) {
        map.set(m.id, m)
      }
      // Then, overlay the new/updated rows
      for (const m of rows) {
        // If it's a real server message, it should overwrite any optimistic version
        // We handle the specific optimistic -> server reconciliation in the realtime handler
        map.set(m.id, { ...(map.get(m.id) || {}), ...m })
      }
      return Array.from(map.values()).sort((a, b) => a.created_at.localeCompare(b.created_at))
    })
  }, [])

  const throttledMarkRead = useCallback(async () => {
    const now = Date.now()
    if (now - markReadRef.current < 1200) return
    markReadRef.current = now
    await markChatAsRead(supabase, chatId)
  }, [chatId, supabase])

  const refreshTypingUsers = useCallback(() => {
    const channel = channelRef.current
    if (!channel || !user?.id) return
    const state = channel.presenceState() as Record<string, any[]>
    const now = Date.now()
    const ids = new Set<string>()

    for (const entries of Object.values(state || {})) {
      for (const p of entries || []) {
        const uid = p?.user_id as string | undefined
        const typing = p?.typing === true
        const sameChat = p?.chat_id === chatId
        const ts = typeof p?.t === 'number' ? p.t : 0
        const fresh = now - ts <= TYPING_TIMEOUT_MS
        if (uid && uid !== user.id && typing && sameChat && fresh) ids.add(uid)
      }
    }

    setTypingUsers(Array.from(ids))
  }, [chatId, user?.id])

  async function emitTyping(nextTyping: boolean) {
    const channel = channelRef.current
    if (!channel || !user?.id) return
    await channel.track({ user_id: user.id, chat_id: chatId, typing: nextTyping, t: Date.now() })
    refreshTypingUsers()
  }

  // Realtime subscriptions: messages, reactions, reads, presence
  useEffect(() => {
    if (!chatId || !user?.id) return

    const channel = supabase.channel(`chat:${chatId}`)
    channelRef.current = channel

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      async (payload: any) => {
        const newRow = payload.new as MessageRow
        const oldRow = payload.old as MessageRow

        if (payload.eventType === 'INSERT' && newRow?.id) {
          // Priority 1 & 2: Reconciliation
          setPendingSends((prev) => {
            const next = { ...prev }
            let reconciled = false
            for (const [k, v] of Object.entries(next)) {
              // Match by content and metadata to find the optimistic twin
              if (
                v.sender_id === newRow.sender_id &&
                v.body === newRow.body &&
                v.reply_to_id === newRow.reply_to_id
              ) {
                delete next[k]
                reconciled = true
                // Remove the optimistic one from the messages array immediately
                setMessages((curr) => curr.filter((m) => m.id !== k))
                break
              }
            }
            return next
          })

          upsertMessages([newRow])

          if (newRow.reply_to_id) {
            const map = await fetchRepliedToBatch(supabase, [newRow.reply_to_id])
            setRepliedToMap((prev) => new Map([...prev, ...map]))
          }
          await throttledMarkRead()
        }

        if (payload.eventType === 'UPDATE' && newRow?.id) {
          upsertMessages([newRow])
        }

        if (payload.eventType === 'DELETE' && oldRow?.id) {
          setMessages((prev) => prev.filter((m) => m.id !== oldRow.id))
        }
      }
    )

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_reactions' },
      async (payload: any) => {
        const newRow = payload.new as ReactionRow
        const oldRow = payload.old as ReactionRow
        const row = newRow || oldRow
        if (!row?.message_id) return

        // Priority 3: Incremental local updates instead of bulk refetch
        setReactionsByMsg((prev) => {
          const current = prev[row.message_id] || []
          if (payload.eventType === 'INSERT') {
            // Only add if not already there
            if (current.some(r => r.id === newRow.id)) return prev
            return { ...prev, [row.message_id]: [...current, newRow] }
          }
          if (payload.eventType === 'DELETE') {
            return { ...prev, [row.message_id]: current.filter(r => r.id !== oldRow.id) }
          }
          return prev
        })
      }
    )
    
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_reads' },
      async (payload: any) => {
        const newRow = payload.new as ReadRow
        const oldRow = payload.old as ReadRow
        const row = newRow || oldRow
        if (!row?.message_id) return

        // Priority 3: Incremental local updates
        setReadsByMsg((prev) => {
          const current = prev[row.message_id] || []
          if (payload.eventType === 'INSERT') {
            if (current.some(r => r.id === newRow.id)) return prev
            return { ...prev, [row.message_id]: [...current, newRow] }
          }
          // Reads are usually only inserted, but handle DELETE just in case
          if (payload.eventType === 'DELETE') {
            return { ...prev, [row.message_id]: current.filter(r => r.id !== oldRow.id) }
          }
          return prev
        })
      }
    )

    channel.on('presence', { event: 'sync' }, refreshTypingUsers)
    channel.on('presence', { event: 'join' }, refreshTypingUsers)
    channel.on('presence', { event: 'leave' }, refreshTypingUsers)

    channel.subscribe(async (status: any) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user_id: user.id, chat_id: chatId, typing: false, t: Date.now() })
        refreshTypingUsers()
      }
    })

    const iv = window.setInterval(refreshTypingUsers, 1000)

    return () => {
      window.clearInterval(iv)
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [chatId, supabase, user?.id, refreshTypingUsers, throttledMarkRead, upsertMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  // Intent router - called by ChatInputArea for all message types
  const handleIntent = useCallback(async (payload: ChatIntentPayload) => {
    if (!user?.id) return

    // --- Text message (fast path with optimistic UI) ---
    if (payload.type === 'text') {
      const trimmed = payload.text?.trim()
      if (!trimmed) return

      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const optimistic: MessageRow = {
        id: optimisticId,
        chat_id: chatId,
        sender_id: user.id,
        body: trimmed,
        type: 'text',
        created_at: new Date().toISOString(),
        edited_at: null,
        deleted_at: null,
        deleted_for_everyone: false,
        reply_to_id: replyTo?.id ?? null,
      }

      try {
        setPendingSends((prev) => ({ ...prev, [optimisticId]: optimistic }))
        upsertMessages([optimistic])
        setReplyTo(null)
        clearDraft(chatId)

        await sendTextMessage(supabase, chatId, user.id, trimmed, optimistic.reply_to_id)
        await emitTyping(false)
        await throttledMarkRead()
      } catch (e: any) {
        setError(e?.message || 'Send failed')
        setPendingSends((prev) => {
          const next = { ...prev }
          delete next[optimisticId]
          return next
        })
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      }
      return
    }

    // --- Media / file intents (voice, image, video, document) ---
    if (payload.file) {
      const optimisticId = `optimistic-media-${Date.now()}`
      const blobUrl = URL.createObjectURL(payload.file)
      const isVoice = payload.type === 'voice'
      const label = isVoice ? '🎤 Voice note' : `📎 Uploading ${payload.file.name}...`
      
      const optimisticMsg: MessageRow = {
        id: optimisticId,
        chat_id: chatId,
        sender_id: user.id,
        body: `${label}\n${blobUrl}`,
        type: 'text',
        created_at: new Date().toISOString(),
        edited_at: null,
        deleted_at: null,
        deleted_for_everyone: false,
        reply_to_id: replyTo?.id ?? null,
      }

      setPendingSends((prev) => ({ ...prev, [optimisticId]: optimisticMsg }))
      upsertMessages([optimisticMsg])
      setReplyTo(null)
      clearDraft(chatId)

      try {
        const { url, error: uploadError } = await processChatIntent(chatId, payload, supabase)
        if (uploadError) throw uploadError
        if (url) {
          const finalLabel = isVoice ? '🎤 Voice note' : `📎 ${payload.file.name}`
          await sendTextMessage(supabase, chatId, user.id, `${finalLabel}\n${url}`, optimisticMsg.reply_to_id)
        }
      } catch (e: any) {
        setError(e?.message || 'Media upload failed')
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        setPendingSends((prev) => {
          const next = { ...prev }
          delete next[optimisticId]
          return next
        })
      } finally {
        URL.revokeObjectURL(blobUrl)
      }
      return
    }

    // --- Poll intent ---
    if (payload.type === 'poll' && payload.metadata) {
      const { question, options, isMultiple, isAnonymous, closesInHours } = payload.metadata
      const pollOptions = options.map((text: string, i: number) => ({ id: `opt-${i}`, text }))
      
      const closesAt = closesInHours 
        ? new Date(Date.now() + closesInHours * 3600000).toISOString() 
        : null

      try {
        const msg = await import('@/lib/chat/queries').then(q => 
          q.createPoll(supabase, chatId, user.id, {
            question,
            options: pollOptions,
            isMultiple,
            isAnonymous,
            closesAt
          })
        )
        // No optimistic UI for polls yet, let the realtime channel pick it up
      } catch (e: any) {
        setError(e?.message || 'Poll creation failed')
      }
      return
    }

    // --- Contact intent ---
    if (payload.type === 'contact' && payload.metadata) {
      const contact = payload.metadata as ProfileLite
      try {
        await supabase.from('messages').insert({
          chat_id: chatId,
          sender_id: user.id,
          type: 'contact',
          body: `📎 Shared contact: ${contact.display_name || contact.username}`,
          metadata: contact
        })
      } catch (e: any) {
        setError(e?.message || 'Contact sharing failed')
      }
      return
    }

    // --- Location intent ---
    if (payload.type === 'location' && payload.metadata) {
      const { type, latitude, longitude, address, durationMinutes } = payload.metadata
      try {
        const { data: msg, error: msgError } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            sender_id: user.id,
            type: 'location',
            body: `📍 ${type === 'live' ? 'Live Location' : 'Location'}: ${address}`,
            metadata: payload.metadata
          })
          .select()
          .single()

        if (msgError) throw msgError

        if (type === 'live' && durationMinutes) {
          const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString()
          await supabase.from('live_location_sessions').insert({
            message_id: msg.id,
            user_id: user.id,
            chat_id: chatId,
            latitude,
            longitude,
            expires_at: expiresAt
          })
        }
      } catch (e: any) {
        setError(e?.message || 'Location sharing failed')
      }
      return
    }

    // --- Event intent ---
    if (payload.type === 'event' && payload.metadata) {
      const { title, description, location, meetingLink, timezone, startTime, endTime } = payload.metadata
      try {
        const { error: eventError } = await supabase.rpc('create_event_with_message', {
          p_chat_id: chatId,
          p_sender_id: user.id,
          p_title: title,
          p_description: description || null,
          p_location: location || null,
          p_start_time: startTime,
          p_end_time: endTime || null,
          p_meeting_link: meetingLink || null,
          p_timezone: timezone || null,
        })
        if (eventError) throw eventError
      } catch (e: any) {
        setError(e?.message || 'Event creation failed')
      }
      return
    }

  }, [chatId, supabase, user?.id, replyTo?.id, upsertMessages, throttledMarkRead])

  async function handleEdit(msg: MessageRow) {
    const next = window.prompt('Edit message', msg.body || '')
    if (next == null) return
    try {
      await editMessage(supabase, msg.id, next)
    } catch (e: any) {
      setError(e?.message || 'Edit failed')
    }
  }

  async function handleDeleteForMe(msg: MessageRow) {
    try {
      await deleteMessageForMe(supabase, msg.id)
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      setPendingSends((prev) => {
        const next = { ...prev }
        delete next[msg.id]
        return next
      })
    } catch (e: any) {
      setError(e?.message || 'Delete failed')
    }
  }

  async function handleDeleteForEveryone(msg: MessageRow) {
    try {
      await deleteMessageForEveryone(supabase, msg.id)
    } catch (e: any) {
      setError(e?.message || 'Delete for everyone failed')
    }
  }

  async function handleReact(msg: MessageRow, emoji: string) {
    try {
      await toggleReaction(supabase, msg.id, emoji)
      const rs = await fetchReactionsBulk(supabase, [msg.id])
      setReactionsByMsg((prev) => ({ ...prev, [msg.id]: rs.filter((r) => r.message_id === msg.id) }))
    } catch (e: any) {
      setError(e?.message || 'Reaction failed')
    }
  }

  function handleTypingChange(isTyping: boolean) {
    emitTyping(isTyping)
    if (isTyping) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => {
        emitTyping(false)
      }, TYPING_TIMEOUT_MS)
    }
  }

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading chat…</div>
  if (!user?.id) return <div className="p-4 text-sm text-muted-foreground">Please log in</div>

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/chats" className="md:hidden">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Avatar className="h-10 w-10">
            <AvatarImage src={chatMeta?.other?.avatar_url || chatMeta?.chat?.avatar_url || undefined} />
            <AvatarFallback className="bg-brand-gradient p-2">
              <img src="/logo.png" alt="KuikChat" className="h-full w-full object-contain" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <span>{chatMeta?.other?.display_name || chatMeta?.chat?.name || 'KuikChat User'}</span>
              {chatMeta?.other && (chatMeta.other.plan === 'ultra' || chatMeta.other.plan === 'business') && (
                <svg className="h-3.5 w-3.5 text-brand-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {chatMeta?.other ? 'Active' : chatMeta?.chat?.type === 'group' ? 'Group chat' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {error ? <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div> : null}

      {/* Filter Status Bar */}
      {(filterCommand || searchQuery) ? (
        <div className="flex items-center justify-between border-b bg-brand-blue-500/10 px-4 py-2 text-sm text-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-muted-foreground">Filtered by:</span>
            <span className="rounded-md bg-brand-blue-500/20 px-2 py-0.5 font-mono text-xs font-bold text-brand-blue-600">
              {filterCommand ? `/${filterCommand}` : `Hermes: "${searchQuery}"`}
            </span>
          </div>
          <button
            onClick={() => {
              setFilterCommand(null)
              setSearchQuery(null)
            }}
            className="rounded-lg px-2.5 py-1 text-xs font-bold bg-accent/60 hover:bg-accent text-foreground transition-all"
          >
            Clear Filter
          </button>
        </div>
      ) : null}

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4">
        {filteredMessages.length === 0 && (filterCommand || searchQuery) ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <p className="text-sm">No messages found matching your filter.</p>
          </div>
        ) : null}

        {(() => {
          let lastDateStr = ''
          return filteredMessages
            .filter((m) => !m.id.startsWith('optimistic-') || pendingSends[m.id])
            .map((msg) => {
              const mine = msg.sender_id === user.id
              const reads = readsByMsg[msg.id] || []
              const wasReadByOther = mine && reads.some((r) => r.user_id !== user.id)
              
              const msgDate = new Date(msg.created_at)
              const msgDateStr = msgDate.toDateString()
              const showDivider = msgDateStr !== lastDateStr
              lastDateStr = msgDateStr

              return (
                <div key={msg.id} className="flex flex-col">
                  {showDivider && <DayDivider date={msg.created_at} />}
                  <MessageBubble
                    msg={msg}
                    mine={mine}
                    replyTo={msg.reply_to_id ? repliedToMap.get(msg.reply_to_id) || null : null}
                    reactions={reactionsByMsg[msg.id] || []}
                    wasReadByOther={wasReadByOther}
                    currentUserId={user.id}
                    onEdit={handleEdit}
                    onDeleteForMe={handleDeleteForMe}
                    onDeleteForEveryone={handleDeleteForEveryone}
                    onReply={setReplyTo}
                    onReact={handleReact}
                  />
                </div>
              )
            })
        })()}
      </div>

      <TypingIndicator typingUsers={typingUsers} className="border-t" />

      {replyTo ? (
        <div className="border-t px-4 pt-2">
          <ReplyPreview
            label="Replying to"
            body={replyTo.body}
            onClear={() => setReplyTo(null)}
          />
        </div>
      ) : null}

      <ChatInputArea
        onIntent={handleIntent}
        onTypingChange={handleTypingChange}
        disabled={loading}
        currentUserId={user.id}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onRunCommand={handleRunCommand}
        onHermesSearch={handleHermesSearch}
      />
    </div>
  )
}
