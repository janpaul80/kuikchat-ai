'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  ArrowLeft,
  Sparkles,
  Check,
  CheckCheck,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatTime } from '@/lib/utils'

interface Message {
  id: string
  text: string
  fromMe: boolean
  time: Date
  status?: 'sent' | 'delivered' | 'read'
}

const HERMES_GREETING: Message = {
  id: 'hermes-greet',
  text: "Hi! I'm Hermes, your AI assistant. I can help you write, translate, summarize, generate images, and much more. What can I do for you today?",
  fromMe: false,
  time: new Date(),
}

export function HermesChatWindow() {
  const [messages, setMessages] = useState<Message[]>([HERMES_GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      fromMe: true,
      time: new Date(),
      status: 'sent',
    }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMsg].map((m) => ({
            role: m.fromMe ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      })
      const data = await res.json()
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "Sorry, I couldn't process that.",
        fromMe: false,
        time: new Date(),
      }
      setMessages((prev) => [...prev, reply])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: '⚠️ Hermes is unavailable. Please make sure OPENAI_API_KEY is set.',
          fromMe: false,
          time: new Date(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Link href="/chats" className="md:hidden">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Avatar className="h-10 w-10">
            <div className="flex h-full w-full items-center justify-center bg-brand-gradient text-white">
              <Sparkles className="h-5 w-5" />
            </div>
          </Avatar>
          <div>
            <h2 className="font-semibold">Hermes AI</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Always available • <Sparkles className="h-3 w-3 text-brand-blue-500 inline" /> Powered by GPT-4
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost"><Search className="h-5 w-5" /></Button>
          <Button size="icon" variant="ghost"><MoreVertical className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, hsl(var(--accent) / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.05) 0%, transparent 50%)',
        }}
      >
        <div className="mx-auto max-w-3xl space-y-2">
          {messages.map((msg) => (
            <Bubble key={msg.id} message={msg} />
          ))}
          {sending && (
            <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-brand-blue-500" />
              <span>Hermes is thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-border bg-card p-3"
      >
        <Button type="button" size="icon" variant="ghost"><Smile className="h-5 w-5" /></Button>
        <Button type="button" size="icon" variant="ghost"><Paperclip className="h-5 w-5" /></Button>
        <Input
          placeholder="Ask Hermes anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
          disabled={sending}
        />
        {input.trim() ? (
          <Button type="submit" size="icon" variant="gradient" disabled={sending}>
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button type="button" size="icon" variant="gradient">
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </form>
    </div>
  )
}

function Bubble({ message }: { message: Message }) {
  return (
    <div className={cn('flex gap-2', message.fromMe ? 'justify-end' : 'justify-start')}>
      {!message.fromMe && (
        <div className="w-8 shrink-0">
          <Avatar className="h-8 w-8">
            <div className="flex h-full w-full items-center justify-center bg-brand-gradient text-white">
              <Sparkles className="h-4 w-4" />
            </div>
          </Avatar>
        </div>
      )}
      <div
        className={cn(
          'group max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm',
          message.fromMe
            ? 'rounded-br-sm bg-brand-gradient text-white'
            : 'rounded-bl-sm bg-card text-card-foreground'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-[10px]',
            message.fromMe ? 'text-white/80' : 'text-muted-foreground'
          )}
        >
          <span>{formatTime(message.time)}</span>
          {message.fromMe && message.status && (
            <>
              {message.status === 'sent' && <Check className="h-3 w-3" />}
              {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
              {message.status === 'read' && <CheckCheck className="h-3 w-3 text-brand-green-200" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
