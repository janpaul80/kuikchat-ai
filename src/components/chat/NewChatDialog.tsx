'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MessageSquarePlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface ProfileResult {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

interface NewChatDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * IMPORTANT: when constructing a PostgREST `.or(...)` filter string,
 * ilike wildcards MUST be `*` (not `%`).
 * PostgREST's URL-based filter parser uses `*` and internally maps it to `%`;
 * using a literal `%` gets URL-encoded to `%25` and the pattern breaks.
 * See: https://postgrest.org/en/stable/api.html#operators
 */
function buildSearchFilter(term: string) {
  // escape PostgREST special chars that would break the .or() string
  // (commas, parentheses, dots inside the value). We keep it simple and
  // strip dangerous chars since a username is [a-z0-9_].
  const safe = term.replace(/[(),.]/g, '')
  return `username.ilike.*${safe}*,display_name.ilike.*${safe}*,email.ilike.*${safe}*`
}

export function NewChatDialog({ open, onClose }: NewChatDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProfileResult[]>([])
  const [searching, setSearching] = useState(false)
  const [opening, setOpening] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Reset state each time the dialog re-opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setError(null)
    }
  }, [open])

  // Debounced auto-search as the user types
  useEffect(() => {
    if (!open) return
    const raw = query.trim().replace(/^@/, '')
    if (!raw) {
      setResults([])
      setError(null)
      return
    }

    let cancelled = false
    setSearching(true)
    const t = window.setTimeout(async () => {
      setError(null)
      try {
        // exclude the current user from the results
        const { data: auth } = await supabase.auth.getUser()
        const me = auth.user?.id

        let q = supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .or(buildSearchFilter(raw))
          .limit(15)

        if (me) q = q.neq('id', me)

        const { data, error: err } = await q

        if (cancelled) return

        if (err) {
          // eslint-disable-next-line no-console
          console.debug('[NewChatDialog] search error', { term: raw, err })
          setError(err.message)
          setResults([])
        } else {
          // eslint-disable-next-line no-console
          console.debug('[NewChatDialog] search ok', { term: raw, count: data?.length })

          const rawResults = (data || []) as ProfileResult[]
          const dedupedById = Array.from(
            new Map(rawResults.map((p) => [p.id, p])).values()
          )

          const qLower = raw.toLowerCase()
          dedupedById.sort((a, b) => {
            const aU = (a.username || '').toLowerCase()
            const bU = (b.username || '').toLowerCase()
            const aExact = aU === qLower ? 1 : 0
            const bExact = bU === qLower ? 1 : 0
            if (aExact !== bExact) return bExact - aExact
            return aU.localeCompare(bU)
          })

          setResults(dedupedById)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Search failed')
          setResults([])
        }
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [query, open, supabase])

  if (!open) return null

  // Manual submit kept for Enter key convenience (already handled by debounce,
  // but we want to prevent a page reload when the form submits)
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  async function openChatWith(otherId: string) {
    setOpening(otherId)
    setError(null)
    const { data, error: err } = await supabase.rpc('upsert_direct_chat', {
      p_other: otherId,
    })
    setOpening(null)
    if (err) {
      setError(err.message)
      return
    }
    if (data) {
      onClose()
      router.push(`/chats/${data}`)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-brand-blue-500" />
          <h2 className="text-lg font-semibold">Start a new chat</h2>
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by @username, name, or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9"
              autoFocus
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </form>

        {error && (
          <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-4 max-h-80 overflow-y-auto scrollbar-thin">
          {!searching && results.length === 0 && query && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          )}
          {!query && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Search for a user by their @username to start a conversation.
            </p>
          )}
          {results.map((p) => {
            const name = p.display_name || p.username || 'User'
            return (
              <button
                key={p.id}
                onClick={() => openChatWith(p.id)}
                disabled={opening === p.id}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent disabled:opacity-60"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{name}</div>
                  {p.username && (
                    <div className="truncate text-xs text-muted-foreground">@{p.username}</div>
                  )}
                </div>
                {opening === p.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
