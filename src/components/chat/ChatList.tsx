'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Search, Plus, Pin, BellOff, CheckCheck, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, getInitials, formatRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuthUser } from '@/hooks/useAuthUser'
import { fetchChatList } from '@/lib/chat/queries'
import type { ChatListItem } from '@/lib/chat/types'
import { HERMES_CHAT_ID } from '@/lib/chat/types'
import { NewChatDialog } from './NewChatDialog'

// A virtual entry for the always-on Hermes AI chat (Slice A keeps it as a
// special-cased, non-DB chat — wired to OpenAI in earlier phases).
const HERMES_VIRTUAL: ChatListItem = {
  chat: {
    id: HERMES_CHAT_ID,
    type: 'hermes',
    name: 'Hermes AI',
    description: null,
    avatar_url: null,
    created_by: null,
    last_message_at: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  } as any,
  otherMember: null,
  displayName: 'Hermes AI',
  displayAvatar: null,
  lastMessage: null,
  isPinned: true,
  isMuted: false,
  unreadCount: 0,
}

export function ChatList() {
  const params = useParams()
  const activeChatId = params?.chatId as string | undefined
  const { user, loading: authLoading } = useAuthUser()
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [newChatOpen, setNewChatOpen] = useState(false)

  // Initial load + realtime refresh on chat_members / chats / messages change
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setChats([])
      setLoading(false)
      return
    }

    const supabase = createClient()
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchChatList(supabase, user!.id)
        if (mounted) setChats(list)
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load chats')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()

    // Realtime: when *any* message arrives in a chat the user is in, refresh
    // the list (cheap; small payload). For Slice A this is good enough.
    const channel = supabase
      .channel('chat-list-' + user.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          if (!mounted) return
          fetchChatList(supabase, user!.id)
            .then((list) => mounted && setChats(list))
            .catch(() => {})
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_members', filter: `user_id=eq.${user.id}` },
        () => {
          if (!mounted) return
          fetchChatList(supabase, user!.id)
            .then((list) => mounted && setChats(list))
            .catch(() => {})
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [user, authLoading])

  // Compose: Hermes virtual chat + real chats
  const combined = useMemo(() => [HERMES_VIRTUAL, ...chats], [chats])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return combined
    return combined.filter((c) => c.displayName.toLowerCase().includes(q))
  }, [combined, search])

  const pinned = filtered.filter((c) => c.isPinned)
  const others = filtered.filter((c) => !c.isPinned)

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card md:max-w-sm">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <h1 className="text-xl font-bold">Chats</h1>
        <Button
          size="icon"
          variant="gradient"
          className="h-9 w-9 rounded-full"
          onClick={() => setNewChatOpen(true)}
          aria-label="Start new chat"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {(loading || authLoading) && (
          <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading chats...
          </div>
        )}

        {error && (
          <div className="m-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !authLoading && (
          <>
            {pinned.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Pinned
                </div>
                {pinned.map((c) => (
                  <ChatRow key={c.chat.id} item={c} active={c.chat.id === activeChatId} />
                ))}
              </>
            )}

            {others.length > 0 && (
              <>
                {pinned.length > 0 && (
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                    All chats
                  </div>
                )}
                {others.map((c) => (
                  <ChatRow key={c.chat.id} item={c} active={c.chat.id === activeChatId} />
                ))}
              </>
            )}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {search ? 'No chats match your search.' : 'No chats yet — tap + to start one.'}
              </div>
            )}
          </>
        )}
      </div>

      <NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </div>
  )
}

function ChatRow({ item, active }: { item: ChatListItem; active: boolean }) {
  const isHermes = item.chat.type === 'hermes'
  const lastBody = item.lastMessage?.deleted_for_everyone
    ? '🚫 message deleted'
    : item.lastMessage?.body
    ? item.lastMessage.body
    : isHermes
    ? 'Ask me anything ✨'
    : 'No messages yet'

  const lastTime = item.lastMessage?.created_at || item.chat?.last_message_at || null

  return (
    <Link
      href={`/chats/${item.chat.id}`}
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        active ? 'bg-accent' : 'hover:bg-accent/50'
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          {isHermes ? (
            <div className="flex h-full w-full items-center justify-center bg-brand-gradient text-white">
              <span className="text-lg">✨</span>
            </div>
          ) : (
            <>
              <AvatarImage src={item.displayAvatar || undefined} />
              <AvatarFallback>{getInitials(item.displayName)}</AvatarFallback>
            </>
          )}
        </Avatar>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="truncate text-sm font-semibold">
            {item.displayName}
            {isHermes && <span className="ml-1.5 text-xs">✨</span>}
          </h3>
          {lastTime && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(lastTime)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <span className="truncate">{lastBody}</span>
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {item.isPinned && !isHermes && (
              <Pin className="h-3 w-3 text-muted-foreground" />
            )}
            {item.isMuted && <BellOff className="h-3 w-3 text-muted-foreground" />}
            {item.unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-blue-500 px-1.5 text-xs font-semibold text-white">
                {item.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
