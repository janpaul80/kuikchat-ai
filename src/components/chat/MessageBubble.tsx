'use client'

import { Check, CheckCheck, SmilePlus, MessageSquareReply, Pencil, Trash2, Trash } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ReactionPicker } from './ReactionPicker'
import { ReplyPreview } from './ReplyPreview'
import type { MessageRow, ReactionRow, RepliedToPreview } from '@/lib/chat/types'
import { cn } from '@/lib/utils'

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
}: MessageBubbleProps) {
  const deleted = !!msg.deleted_for_everyone || !!msg.deleted_at
  const grouped = new Map<string, number>()
  for (const r of reactions) grouped.set(r.emoji, (grouped.get(r.emoji) || 0) + 1)

  return (
    <div className={cn('group mb-3 flex', mine ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[75%]">
        <div
          className={cn(
            'rounded-2xl px-3 py-2 shadow-sm',
            mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          )}
        >
          {replyTo ? (
            <div className="mb-2">
              <ReplyPreview
                label={replyTo.sender_id === msg.sender_id ? 'Replying to self' : 'Replying'}
                body={replyTo.deleted_for_everyone ? '[deleted]' : replyTo.body}
              />
            </div>
          ) : null}

          <p className={cn('whitespace-pre-wrap break-words text-sm', deleted && 'italic opacity-70')}>
            {deleted ? 'This message was deleted' : msg.body || ''}
          </p>

          <div className="mt-1 flex items-center justify-end gap-2 text-[10px] opacity-80">
            {msg.edited_at ? <span>edited</span> : null}
            <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
            {mine ? (
              wasReadByOther ? <CheckCheck className="h-3.5 w-3.5 text-blue-300" /> : <Check className="h-3.5 w-3.5" />
            ) : null}
          </div>
        </div>

        {grouped.size > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {[...grouped.entries()].map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact?.(msg, emoji)}
                className="rounded-full border bg-background px-2 py-0.5 text-xs"
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            'mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100',
            mine ? 'justify-end' : 'justify-start'
          )}
        >
          <ReactionPicker
            onSelect={(emoji) => onReact?.(msg, emoji)}
            trigger={
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Add reaction"
              >
                <SmilePlus className="h-3.5 w-3.5" />
              </button>
            }
          />
          <button
            type="button"
            onClick={() => onReply?.(msg)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Reply"
          >
            <MessageSquareReply className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(msg)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteForMe?.(msg)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Delete for me"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {mine ? (
            <button
              type="button"
              onClick={() => onDeleteForEveryone?.(msg)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-destructive/30 bg-background/80 text-destructive hover:bg-destructive/10"
              aria-label="Delete for everyone"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
