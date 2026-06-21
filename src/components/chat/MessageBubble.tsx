'use client'

import { useState, type ReactNode } from 'react'
import { SmilePlus, MessageSquareReply, Pencil, Trash2, Trash, FileText, Loader2 } from 'lucide-react'
import { ReactionPicker } from './ReactionPicker'
import { ReplyPreview } from './ReplyPreview'
import { VoiceMessageBubble } from './VoiceMessageBubble'
import { PollWidget } from './polls/PollWidget'
import { ContactCard } from './ContactCard'
import { LocationCard } from './LocationCard'
import { EventCard } from './EventCard'
import { FileNinjaDeliveryCard, isReadyFileNinjaMessage } from './FileNinjaDeliveryCard'
import type { MessageRow, ReactionRow, RepliedToPreview, ProfileLite } from '@/lib/chat/types'
import { cn } from '@/lib/utils'

import { Ic, ICONS } from './_icons'
import MessageStamp from './MessageStamp'

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

export type KCMessageType = 'standard' | 'quote' | 'ai' | 'imported' | 'media'

export interface MessageBubbleProps {
  msg?: MessageRow
  mine?: boolean
  replyTo?: RepliedToPreview | null
  reactions?: ReactionRow[]
  wasReadByOther?: boolean
  onEdit?: (msg: MessageRow) => void
  onDeleteForMe?: (msg: MessageRow) => void
  onDeleteForEveryone?: (msg: MessageRow) => void
  onReply?: (msg: MessageRow) => void
  onReact?: (msg: MessageRow, emoji: string) => void
  currentUserId?: string
  // Props from upgrade styles patch:
  type?: KCMessageType
  quotedText?: string
  mediaCaption?: string
  children?: ReactNode
}

export function MessageBubble({
  msg,
  mine = false,
  replyTo,
  reactions = [],
  wasReadByOther = false,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onReply,
  onReact,
  currentUserId,
  type,
  quotedText,
  mediaCaption,
  children,
}: MessageBubbleProps) {
  const [clamped, setClamped] = useState(true)
  const deleted = !!msg?.deleted_for_everyone || !!msg?.deleted_at
  const grouped = new Map<string, { count: number; reacted: boolean }>()
  
  // Group reactions
  for (const r of reactions) {
    const state = Math.max(0, grouped.get(r.emoji)?.count || 0)
    grouped.set(r.emoji, { count: state + 1, reacted: r.user_id === currentUserId })
  }

  // Determine type
  let finalType: KCMessageType = type || 'standard'
  if (!type && msg) {
    if (msg.type === 'hermes' || msg.sender_id === 'hermes') {
      finalType = 'ai'
    } else if (msg.reply_to_id) {
      finalType = 'quote'
    } else if (msg.metadata?.style === 'imported') {
      finalType = 'imported'
    } else if (
      msg.type === 'image' ||
      msg.type === 'video' ||
      msg.type === 'audio' ||
      msg.type === 'voice' ||
      msg.type === 'file' ||
      msg.type === 'sticker' ||
      msg.type === 'gif'
    ) {
      finalType = 'media'
    }
  }

  const isCustomType = finalType !== 'standard'

  // Build content element
  let content: ReactNode = children
  if (!content && msg) {
    if (msg.type === 'file' && isReadyFileNinjaMessage(msg.metadata)) {
      content = <FileNinjaDeliveryCard metadata={msg.metadata} mine={mine} />
    } else if (isVoiceBody(msg.body)) {
      const parsed = parseMediaBody(msg.body)
      content = parsed ? <VoiceMessageBubble url={parsed.url} mine={mine} /> : null
    } else if (isImageBody(msg.body)) {
      const parsed = parseMediaBody(msg.body)
      const isUploading = parsed?.url.startsWith('blob:')
      content = parsed ? (
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
    } else if (parseMediaBody(msg.body)) {
      const parsed = parseMediaBody(msg.body)!
      content = (
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
    } else if (msg.type === 'poll') {
      content = currentUserId ? <PollWidget messageId={msg.id} chatId={msg.chat_id} currentUserId={currentUserId} /> : null
    } else if (msg.type === 'contact') {
      content = <ContactCard contact={msg.metadata as ProfileLite} mine={mine} />
    } else if (msg.type === 'location') {
      content = (
        <LocationCard
          type={(msg.metadata as any)?.type || 'static'}
          latitude={(msg.metadata as any)?.latitude}
          longitude={(msg.metadata as any)?.longitude}
          address={(msg.metadata as any)?.address}
          messageId={msg.id}
          mine={mine}
          currentUserId={currentUserId!}
        />
      )
    } else if (msg.type === 'event') {
      content = currentUserId ? (
        <EventCard
          messageId={msg.id}
          chatId={msg.chat_id}
          currentUserId={currentUserId}
        />
      ) : null
    } else {
      content = (
        <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed">
          {msg.body || ''}
        </p>
      )
    }
  }

  // Nested ReplyPreview if replyTo is present but style is not Quote (Quote has its own layout)
  if (replyTo && finalType !== 'quote') {
    content = (
      <>
        <div className="mb-2 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
          <ReplyPreview
            label={replyTo.sender_id === msg?.sender_id ? 'You' : 'Others'}
            body={replyTo.deleted_for_everyone ? 'Message deleted' : replyTo.body}
            className="border-l-2 border-primary/50 py-1 pl-2 text-[11px]"
          />
        </div>
        {content}
      </>
    )
  }

  // Build inner layout
  let inner: ReactNode
  if (deleted) {
    inner = (
      <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed italic opacity-60">
        This message was deleted
      </p>
    )
  } else {
    switch (finalType) {
      case 'quote':
        inner = (
          <div className="kc-quote">
            <span className="kc-tag">
              <Ic d={ICONS.quote} />
              Quote
            </span>
            {quotedText && <div className="kc-quoted">{quotedText}</div>}
            {!quotedText && replyTo && (
              <div className="kc-quoted">
                {replyTo.deleted_for_everyone ? 'Message deleted' : replyTo.body}
              </div>
            )}
            <div>{content}</div>
          </div>
        )
        break
      case 'ai':
        inner = (
          <div className="kc-ai">
            <span className="kc-tag">
              <Ic d={ICONS.hermes} />
              Hermes
            </span>
            {content}
          </div>
        )
        break
      case 'imported':
        inner = (
          <div className="kc-paste">
            <span className="kc-tag">
              <Ic d={ICONS.imported} />
              Imported block
            </span>
            <div className={cn("kc-block", clamped && "kc-clamped")}>{content}</div>
            <button className="kc-expand" onClick={() => setClamped(c => !c)}>
              {clamped ? "Show full block" : "Collapse"}
            </button>
          </div>
        )
        break
      case 'media':
        inner = (
          <div className="kc-media">
            {content}
            {mediaCaption && <div className="kc-media-cap">{mediaCaption}</div>}
          </div>
        )
        break
      default:
        inner = <div>{content}</div>
    }
  }

  const bubbleClasses = cn(
    'relative px-3.5 py-2 shadow-sm transition-all',
    finalType === 'standard' && (
      mine 
        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none'
    ),
    finalType === 'quote' && 'kc-quote text-zinc-900 dark:text-zinc-100',
    finalType === 'ai' && 'kc-ai text-zinc-900 dark:text-zinc-100',
    finalType === 'imported' && 'kc-paste text-zinc-900 dark:text-zinc-100',
    finalType === 'media' && 'kc-media bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100'
  )

  return (
    <div className={cn('group relative mb-3 flex w-full', mine ? 'justify-end' : 'justify-start')}>
      <div className={cn('kc-msg flex max-w-[75%] flex-col', mine ? 'kc-me items-end' : 'items-start')}>
        <div className={bubbleClasses}>
          {msg?.metadata?.sender_name && !mine && (
            <div className="text-[11px] font-bold mb-1.5 flex items-center gap-1 opacity-85">
              <span>{msg.metadata.sender_name}</span>
              {(msg.metadata.sender_plan === 'ultra' || msg.metadata.sender_plan === 'business') && (
                <svg className="h-3.5 w-3.5 text-brand-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </div>
          )}
          {inner}
        </div>

        {msg && (
          <MessageStamp
            sent={msg.created_at}
            mine={mine}
            read={wasReadByOther ? msg.created_at : undefined}
            edited={msg.edited_at || undefined}
            delivered={msg.created_at}
          />
        )}

        {grouped.size > 0 ? (
          <div className={cn('mt-1.5 flex flex-wrap gap-1', mine ? 'justify-end' : 'justify-start')}>
            {[...grouped.entries()].map(([emoji, { count, reacted }]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => msg && onReact?.(msg, emoji)}
                className={cn(
                  'flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600 transition-all hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
                  reacted && 'border-brand-blue-500/50 bg-brand-blue-500/5 text-brand-blue-600',
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
      {!deleted && msg && (
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

export default MessageBubble
