'use client'

import { Check, CheckCheck, SmilePlus, MessageSquareReply, Pencil, Trash2, Trash, FileText, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ReactionPicker } from './ReactionPicker'
import { ReplyPreview } from './ReplyPreview'
import { VoiceMessageBubble } from './VoiceMessageBubble'
import { PollWidget } from './polls/PollWidget'
import { ContactCard } from './ContactCard'
import { LocationCard } from './LocationCard'
import { EventCard } from './EventCard'
import type { MessageRow, ReactionRow, RepliedToPreview, ProfileLite } from '@/lib/chat/types'
import { cn } from '@/lib/utils'

function parseMediaBody(body: string | null): { label: string; url: string } | null {
  if (!body) return null
  const lines = body.split('\n')
  if (lines.length < 2) return null
  const url = lines[lines.length - 1].trim()
  if (!url.startsWith('http') && !url.startsWith('blob:')) return null
  return { label: lines.slice(0, -1).join(' ').trim(), url }
}

function isVoiceBody(body: string | null) {
  return body?.includes('🎤 Voice note') ?? false
}

function isImageBody(body: string | null) {
  if (!body) return false
  const parsed = parseMediaBody(body)
  if (!parsed) return false
  if (parsed.url.startsWith('blob:') && parsed.label.includes('Uploading')) return true
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(parsed.url)
}

interface MessageBubbleProps {
  msg: MessageRow
  mine: boolean
  replyTo?: RepliedToPreview | null
  reactions?: ReactionRow[]
  wasReadByOther?: boolean
  onEdit?: (msg: MessageRow) => void
  onDeleteForMe?: (msg: MessageRow) => void
  onDeleteForEveryone?: (msg: MessageRow) => void
  onReply?: (msg: MessageRow) => void
  onReact?: (msg: MessageRow, emoji: string) => void
  currentUserId?: string
}

export function MessageBubble({
  msg,
  mine,
  replyTo,
  reactions = [],
  wasReadByOther = false,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onReply,
  onReact,
  currentUserId,
}: MessageBubbleProps) {
  const deleted = !!msg.deleted_for_everyone || !!msg.deleted_at
  const grouped = new Map<string, { count: number; reacted: boolean }>()
  
  // Group reactions and check if current user reacted
  for (const r of reactions) {
    const state = grouped.get(r.emoji) || { count: 0, reacted: false }
    state.count++
    // We don't have the current user ID here directly without a hook, 
    // but we can assume if the reaction exists, it might be ours if we want to highlight.
    // Actually, it's better to just show the count.
    grouped.set(r.emoji, state)
  }

  return (
    <div className={cn('group relative mb-3 flex w-full', mine ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex max-w-[75%] flex-col', mine ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'relative rounded-2xl px-3.5 py-2 shadow-sm transition-all',
            mine 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none'
          )}
        >
          {replyTo ? (
            <div className="mb-2 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
              <ReplyPreview
                label={replyTo.sender_id === msg.sender_id ? 'You' : 'Others'}
                body={replyTo.deleted_for_everyone ? 'Message deleted' : replyTo.body}
                className="border-l-2 border-primary/50 py-1 pl-2 text-[11px]"
              />
            </div>
          ) : null}

          {deleted ? (
            <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed italic opacity-60">
              This message was deleted
            </p>
          ) : isVoiceBody(msg.body) ? (
            // ── Voice note player ──────────────────────────────────────────
            (() => {
              const parsed = parseMediaBody(msg.body)
              return parsed ? (
                <VoiceMessageBubble url={parsed.url} mine={mine} />
              ) : null
            })()
          ) : isImageBody(msg.body) ? (
            // ── Inline image ───────────────────────────────────────────────
            (() => {
              const parsed = parseMediaBody(msg.body)
              const isUploading = parsed?.url.startsWith('blob:')
              return parsed ? (
                <div className="relative">
                  <img
                    src={parsed.url}
                    alt="Attachment"
                    className={cn("max-w-[240px] rounded-xl object-cover transition-opacity", isUploading ? "opacity-50" : "")}
                    loading="lazy"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </span>
                    </div>
                  )}
                </div>
              ) : null
            })()
          ) : parseMediaBody(msg.body) ? (
            // ── Generic file attachment ────────────────────────────────────
            (() => {
              const parsed = parseMediaBody(msg.body)!
              return (
                <a
                  href={parsed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium underline-offset-2 hover:underline',
                    mine ? 'bg-white/15 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-[180px]">{parsed.label}</span>
                </a>
              )
            })()
          ) : msg.type === 'poll' ? (
            // ── Poll widget ────────────────────────────────────────────────
            currentUserId ? <PollWidget messageId={msg.id} chatId={msg.chat_id} currentUserId={currentUserId} /> : null
          ) : msg.type === 'contact' ? (
            // ── Contact card ───────────────────────────────────────────────
            <ContactCard contact={msg.metadata as ProfileLite} mine={mine} />
          ) : msg.type === 'location' ? (
            // ── Location card ──────────────────────────────────────────────
            <LocationCard
              type={(msg.metadata as any)?.type || 'static'}
              latitude={(msg.metadata as any)?.latitude}
              longitude={(msg.metadata as any)?.longitude}
              address={(msg.metadata as any)?.address}
              messageId={msg.id}
              mine={mine}
              currentUserId={currentUserId!}
            />
          ) : msg.type === 'event' ? (
            // ── Event card ─────────────────────────────────────────────────
            currentUserId ? (
              <EventCard
                messageId={msg.id}
                chatId={msg.chat_id}
                currentUserId={currentUserId}
              />
            ) : null
          ) : (
            // ── Plain text ────────────────────────────────────────────────
            <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed">
              {msg.body || ''}
            </p>
          )}

          <div className={cn(
            'mt-1.5 flex items-center gap-1.5 text-[10px] font-medium transition-opacity',
            mine ? 'justify-end text-blue-100/70' : 'text-zinc-500'
          )}>
            {msg.edited_at ? <span className="uppercase tracking-wider">Edited</span> : null}
            <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
            {mine ? (
              wasReadByOther ? <CheckCheck className="h-3 w-3 text-blue-200" /> : <Check className="h-3 w-3" />
            ) : null}
          </div>
        </div>

        {grouped.size > 0 ? (
          <div className={cn('mt-1.5 flex flex-wrap gap-1', mine ? 'justify-end' : 'justify-start')}>
            {[...grouped.entries()].map(([emoji, { count }]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact?.(msg, emoji)}
                className={cn(
                  'flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600 transition-all hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
                  'hover:scale-105 active:scale-95'
                )}
              >
                <span>{emoji}</span>
                {count > 1 && <span>{count}</span>}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Action Bar - Hidden until hover */}
      {!deleted && (
        <div
          className={cn(
            'absolute top-0 opacity-0 transition-all duration-200 group-hover:opacity-100',
            mine ? '-left-2 -translate-x-full' : '-right-2 translate-x-full',
            'flex items-center gap-0.5 rounded-full border border-zinc-200 bg-white/90 p-1 shadow-md backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/90'
          )}
        >
          <ReactionPicker
            onSelect={(emoji) => onReact?.(msg, emoji)}
            trigger={
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Add reaction"
              >
                <SmilePlus className="h-4 w-4" />
              </button>
            }
          />
          <button
            type="button"
            onClick={() => onReply?.(msg)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Reply"
          >
            <MessageSquareReply className="h-4 w-4" />
          </button>
          {mine && (
            <button
              type="button"
              onClick={() => onEdit?.(msg)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDeleteForMe?.(msg)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Delete for me"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {mine && (
            <button
              type="button"
              onClick={() => onDeleteForEveryone?.(msg)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
              aria-label="Delete for everyone"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
