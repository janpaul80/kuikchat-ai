'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useAuthUser } from '@/hooks/useAuthUser'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { MessageRow, ReactionRow, ReadRow, RepliedToPreview } from '@/lib/chat/types'
import {
  fetchMessagesPage,
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
import { loadDraft, saveDraft, clearDraft } from '@/lib/chat/drafts'
import { MessageBubble } from './MessageBubble'
import { ReplyPreview } from './ReplyPreview'
import { TypingIndicator } from './TypingIndicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TYPING_TIMEOUT_MS = 3000

export function RealChatWindow({ chatId }: { chatId: string }) {
  const supabase = useMemo(() => createSupabaseClient(), [])
  const { user } = useAuthUser()

  const [messages, setMessages] = useState<MessageRow[]>([])
  const [pendingSends, setPendingSends] = useState<Record<string, MessageRow>>({})
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<MessageRow | null>(null)
  const [reactionsByMsg, setReactionsByMsg] = useState<Record<string, ReactionRow[]>>({})
  const [readsByMsg, setReadsByMsg] = useState<Record<string, ReadRow[]>>({})
  const [repliedToMap, setRepliedToMap] = useState<Map<string, RepliedToPreview>>(new Map())
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const channelRef = useRef<any>(null)
  const markReadRef = useRef<number>(0)

  // Load initial messages + auxiliary datasets + draft
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!user?.id || !chatId) return
      setLoading(true)
      setError(null)
      try {
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

        const draft = loadDraft(chatId)
        if (draft) {
          setBody(draft.body || '')
          if (draft.replyToId) {
            const target = sorted.find((m) => m.id === draft.replyToId) || null
            setReplyTo(target)
          }
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
      for (const m of prev) map.set(m.id, m)
      for (const m of rows) map.set(m.id, { ...(map.get(m.id) || {}), ...m })
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
        if (payload.eventType === 'INSERT' && newRow?.id) {
          upsertMessages([newRow])

          if (newRow.sender_id === user.id) {
            setPendingSends((prev) => {
              const next = { ...prev }
              for (const [k, v] of Object.entries(next)) {
                if (
                  v.sender_id === newRow.sender_id &&
                  v.chat_id === newRow.chat_id &&
                  v.body === newRow.body &&
                  v.reply_to_id === newRow.reply_to_id
                ) {
                  delete next[k]
                  break
                }
              }
              return next
            })
          }

          if (newRow.reply_to_id) {
            const map = await fetchRepliedToBatch(supabase, [newRow.reply_to_id])
            setRepliedToMap((prev) => new Map([...prev, ...map]))
          }
          await throttledMarkRead()
        }

        if (payload.eventType === 'UPDATE' && newRow?.id) {
          upsertMessages([newRow])
        }
      }
    )

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_reactions' },
      async (payload: any) => {
        const row = (payload.new || payload.old) as ReactionRow | undefined
        if (!row?.message_id) return
        const rs = await fetchReactionsBulk(supabase, [row.message_id])
        setReactionsByMsg((prev) => ({ ...prev, [row.message_id]: rs.filter((x) => x.message_id === row.message_id) }))
      }
    )

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_reads' },
      async (payload: any) => {
        const row = (payload.new || payload.old) as ReadRow | undefined
        if (!row?.message_id) return
        const rs = await fetchReadsBulk(supabase, [row.message_id])
        setReadsByMsg((prev) => ({ ...prev, [row.message_id]: rs.filter((x) => x.message_id === row.message_id) }))
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

  // Persist draft
  useEffect(() => {
    saveDraft(chatId, body, replyTo?.id || null)
  }, [body, chatId, replyTo?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function handleSend() {
    if (!user?.id) return
    const trimmed = body.trim()
    if (!trimmed) return
    try {
      const optimisticId = `optimistic-${Date.now()}`
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
      setPendingSends((prev) => ({ ...prev, [optimisticId]: optimistic }))
      upsertMessages([optimistic])

      await sendTextMessage(supabase, chatId, user.id, trimmed, replyTo?.id ?? null)
      await emitTyping(false)
      setBody('')
      setReplyTo(null)
      clearDraft(chatId)
      await throttledMarkRead()
    } catch (e: any) {
      setError(e?.message || 'Send failed')
    }
  }

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

  function onInputChange(v: string) {
    setBody(v)

    emitTyping(true)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      emitTyping(false)
    }, TYPING_TIMEOUT_MS)
  }

  if (!user?.id) return <div className="p-4 text-sm text-muted-foreground">Please log in</div>
  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading chat…</div>

  return (
    <div className="flex h-full flex-col">
      {error ? <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div> : null}

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4">
        {messages
          .filter((m) => !m.id.startsWith('optimistic-') || pendingSends[m.id])
          .map((msg) => {
          const mine = msg.sender_id === user.id
          const reads = readsByMsg[msg.id] || []
          const wasReadByOther = mine && reads.some((r) => r.user_id !== user.id)
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              mine={mine}
              replyTo={msg.reply_to_id ? repliedToMap.get(msg.reply_to_id) || null : null}
              reactions={reactionsByMsg[msg.id] || []}
              wasReadByOther={wasReadByOther}
              onEdit={handleEdit}
              onDeleteForMe={handleDeleteForMe}
              onDeleteForEveryone={handleDeleteForEveryone}
              onReply={setReplyTo}
              onReact={handleReact}
            />
          )
        })}
      </div>

      <TypingIndicator typingUsers={typingUsers} className="border-t" />

      <div className="border-t px-3 py-3">
        {replyTo ? (
          <div className="mb-2">
            <ReplyPreview
              label="Replying to"
              body={replyTo.body}
              onClear={() => setReplyTo(null)}
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Input
            value={body}
            onChange={(e) => onInputChange(e.target.value)}
            onBlur={() => {
              void emitTyping(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void emitTyping(false)
                handleSend()
              }
            }}
            placeholder="Type a message"
          />
          <Button type="button" onClick={handleSend}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
