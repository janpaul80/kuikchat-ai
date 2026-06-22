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
  FileText,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatTime } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { VoiceMessageBubble } from './VoiceMessageBubble'

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

const EMOJIS = ['😊', '😂', '🤣', '❤️', '👍', '😍', '🤔', '😭', '🔥', '🎉', '👀', '🚀', '✨', '👏', '🙏', '💯']

export function HermesChatWindow() {
  const [messages, setMessages] = useState<Message[]>([HERMES_GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [recording, setRecording] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Voice Note Timer
  useEffect(() => {
    if (recording) {
      setRecordDuration(0)
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current)
        recordIntervalRef.current = null
      }
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current)
    }
  }, [recording])

  const formatRecordDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSmileClick = () => {
    setShowEmojiPicker((prev) => !prev)
  }

  const handleEmojiClick = (emoji: string) => {
    const inputEl = inputRef.current
    if (inputEl) {
      const start = inputEl.selectionStart ?? 0
      const end = inputEl.selectionEnd ?? 0
      const val = inputEl.value
      const newVal = val.substring(0, start) + emoji + val.substring(end)
      setInput(newVal)
      
      // Keep cursor position at the end of the inserted emoji
      setTimeout(() => {
        inputEl.focus()
        inputEl.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setInput((prev) => prev + emoji)
    }
    setShowEmojiPicker(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    const toastId = toast.loading(`Uploading ${file.name}...`)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop() ?? 'bin'
      const filePath = `hermes/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: signedData, error: signedError } = await supabase.storage
        .from('attachments')
        .createSignedUrl(filePath, 86400 * 365) // 1 year signed URL

      if (signedError) throw signedError
      
      const fileUrl = signedData.signedUrl
      const bodyText = `${file.name}\n${fileUrl}`
      
      toast.success('File uploaded successfully!', { id: toastId })
      
      // Send file message
      await sendUserMessage(bodyText, `[Uploaded File: ${file.name}]`)

    } catch (error: any) {
      console.error(error)
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`, { id: toastId })
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleMicClick = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        chunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
          }
        }

        mediaRecorder.start(100)
        setRecording(true)
        toast.info('Voice recording started...')
      } catch (err) {
        console.error('Error starting voice recording:', err)
        toast.error('Could not access microphone.')
      }
    } else {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder || mediaRecorder.state === 'inactive') return

      const toastId = toast.loading('Processing voice note...')
      
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
          
          // Stop stream tracks
          mediaRecorder.stream.getTracks().forEach((track) => track.stop())

          // 1. Upload to Supabase storage 'voice' bucket
          const supabase = createClient()
          const fileName = `hermes/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webm`
          
          const { error: uploadError } = await supabase.storage
            .from('voice')
            .upload(fileName, audioBlob, { contentType: 'audio/webm' })

          if (uploadError) throw uploadError

          const { data: signedData, error: signedError } = await supabase.storage
            .from('voice')
            .createSignedUrl(fileName, 86400 * 365) // 1 year expiry

          if (signedError) throw signedError

          const audioUrl = signedData.signedUrl
          const displayBody = `🎤 Voice note\n${audioUrl}`

          // 2. Transcribe voice note via API
          toast.loading('Transcribing audio...', { id: toastId })
          const formData = new FormData()
          formData.append('file', audioBlob, 'voice_note.webm')

          const transcribeRes = await fetch('/api/hermes/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (!transcribeRes.ok) {
            throw new Error('Transcription failed')
          }

          const transcribeData = await transcribeRes.json()
          const transcription = transcribeData.text || '[Inaudible voice note]'
          
          toast.success(`Transcribed: "${transcription.substring(0, 30)}..."`, { id: toastId })

          // 3. Send message and invoke Hermes
          await sendUserMessage(displayBody, transcription)

        } catch (err: any) {
          console.error(err)
          toast.error(`Voice note error: ${err.message || 'Unknown error'}`, { id: toastId })
        }
      }

      mediaRecorder.stop()
      setRecording(false)
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending, uploadingFile])

  async function sendUserMessage(displayBody: string, aiPromptText: string) {
    const newMsg: Message = {
      id: Date.now().toString(),
      text: displayBody,
      fromMe: true,
      time: new Date(),
      status: 'sent',
    }
    const updatedMessages = [...messages, newMsg]
    setMessages(updatedMessages)
    setSending(true)

    try {
      // Map message history to send to Hermes API
      const apiMessages = updatedMessages.map((m, index) => {
        if (index === updatedMessages.length - 1) {
          return { role: 'user', content: aiPromptText }
        }
        if (isVoiceBody(m.text)) {
          return { role: 'user', content: '[Voice Note]' }
        }
        if (parseMediaBody(m.text)) {
          return { role: 'user', content: `[Attached File: ${parseMediaBody(m.text)!.label}]` }
        }
        return {
          role: m.fromMe ? 'user' : 'assistant',
          content: m.text,
        }
      })

      const res = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
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
          text: '⚠️ Hermes is unavailable. Please check your network or configuration.',
          fromMe: false,
          time: new Date(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    const textToSend = input.trim()
    setInput('')
    await sendUserMessage(textToSend, textToSend)
  }

  return (
    <div className="flex h-full flex-col bg-background relative">
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
          {uploadingFile && (
            <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-brand-blue-500" />
              <span>Uploading file to storage...</span>
            </div>
          )}
          {sending && (
            <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-brand-blue-500" />
              <span>Hermes is thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-border bg-card p-3 relative"
      >
        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-50 flex w-64 flex-wrap gap-1.5 rounded-xl border border-border bg-card p-2.5 shadow-xl backdrop-blur-md">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-transform hover:scale-125 hover:bg-accent active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button type="button" size="icon" variant="ghost" onClick={handleSmileClick}>
          <Smile className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFile}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        {recording ? (
          <div className="flex-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg h-9 px-3 flex items-center justify-between text-xs animate-pulse">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              Recording voice note...
            </span>
            <span className="font-mono">{formatRecordDuration(recordDuration)}</span>
          </div>
        ) : (
          <Input
            ref={inputRef}
            placeholder="Ask Hermes anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={sending || uploadingFile}
          />
        )}

        {input.trim() && !recording ? (
          <Button type="submit" size="icon" variant="gradient" disabled={sending || uploadingFile}>
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="gradient"
            className={cn(recording && "bg-red-600 hover:bg-red-700 text-white")}
            onClick={handleMicClick}
            disabled={uploadingFile}
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </form>
    </div>
  )
}

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
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(parsed.url)
}

function Bubble({ message }: { message: Message }) {
  let content = null
  
  if (isVoiceBody(message.text)) {
    const parsed = parseMediaBody(message.text)
    content = parsed ? <VoiceMessageBubble url={parsed.url} mine={message.fromMe} /> : null
  } else if (isImageBody(message.text)) {
    const parsed = parseMediaBody(message.text)
    content = parsed ? (
      <img
        src={parsed.url}
        alt="Attachment"
        className="max-w-[240px] rounded-xl object-cover border border-border"
        loading="lazy"
      />
    ) : null
  } else if (parseMediaBody(message.text)) {
    const parsed = parseMediaBody(message.text)!
    content = (
      <a
        href={parsed.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium underline-offset-2 hover:underline border',
          message.fromMe 
            ? 'bg-white/10 text-white border-white/20' 
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-border'
        )}
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="truncate max-w-[180px]">{parsed.label}</span>
      </a>
    )
  } else {
    content = <p className="whitespace-pre-wrap break-words">{message.text}</p>
  }

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
            : 'rounded-bl-sm bg-card text-card-foreground border border-border'
        )}
      >
        {content}
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
