'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AttachmentDrawer } from './AttachmentDrawer'
import { VoiceRecorder } from './VoiceRecorder'
import { CreatePollDialog, type PollFormData } from './CreatePollDialog'
import { ContactPickerDialog } from './ContactPickerDialog'
import { LocationPickerDialog } from './LocationPickerDialog'
import { CreateEventDialog, type EventFormData } from './CreateEventDialog'
import type { ChatIntentPayload } from '@/lib/chat/media-service'
import type { ProfileLite } from '@/lib/chat/types'

interface ChatInputAreaProps {
  onIntent: (payload: ChatIntentPayload) => void
  onTypingChange?: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
  currentUserId: string
  onOpenCommandPalette?: () => void
}

export function ChatInputArea({ onIntent, onTypingChange, disabled, placeholder = 'Type a message', currentUserId, onOpenCommandPalette }: ChatInputAreaProps) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPollOpen, setIsPollOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isEventOpen, setIsEventOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Listen for Hermes Copilot "Use" events — populate composer
  useEffect(() => {
    const handler = (e: Event) => {
      const suggestion = (e as CustomEvent<string>).detail
      if (suggestion) {
        setText(suggestion)
        textareaRef.current?.focus()
      }
    }
    window.addEventListener('hermes-copilot-use', handler)
    return () => window.removeEventListener('hermes-copilot-use', handler)
  }, [])
  
  const handleSendText = () => {
    if (!text.trim()) return
    onIntent({ type: 'text', text: text.trim() })
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const handleVoiceSend = async (audioBlob: Blob, durationMs: number) => {
    setIsRecording(false)
    // Try auto-transcribe via Hermes first
    try {
      const formData = new FormData()
      formData.append('file', new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' }))
      const res = await fetch('/api/hermes/transcribe', { method: 'POST', body: formData })
      if (res.ok) {
        const { transcript } = await res.json()
        if (transcript?.trim()) {
          onIntent({ type: 'text', text: transcript.trim() })
          return
        }
      }
    } catch {
      // fall through to raw voice note
    }
    const file = new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' })
    onIntent({ 
      type: 'voice', 
      file, 
      metadata: { duration_ms: durationMs } 
    })
  }

  const handlePollSubmit = (data: PollFormData) => {
    onIntent({
      type: 'poll',
      metadata: data
    })
  }

  const handleContactSelect = (contact: ProfileLite) => {
    onIntent({
      type: 'contact',
      metadata: contact
    })
  }

  const handleLocationSelect = (data: any) => {
    onIntent({
      type: 'location',
      metadata: data
    })
  }

  const handleEventSubmit = (data: EventFormData) => {
    onIntent({
      type: 'event',
      metadata: data
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Rough intent routing based on file type
    const type = file.type.startsWith('image/') ? 'image' 
               : file.type.startsWith('video/') ? 'video' 
               : 'document'

    onIntent({ type, file })
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // If we are currently recording voice, show the voice UI instead of the text composer
  if (isRecording) {
    return (
      <div className="p-4 bg-background border-t border-border">
        <div className="mx-auto max-w-4xl relative">
          <VoiceRecorder 
            onSend={handleVoiceSend} 
            onCancel={() => setIsRecording(false)} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-background border-t border-border">
      <div className="mx-auto max-w-4xl relative">
        <div className="flex items-end gap-2">
          
          <AttachmentDrawer 
            onSelectMedia={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*,video/*'
                fileInputRef.current.click()
              }
            }}
            onSelectDocument={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = '*'
                fileInputRef.current.click()
              }
            }}
            onSelectAI={() => {
              // Future: Open Hermes / Rev-Pro modal
              console.log('Open AI Actions')
            }}
            onSelectPoll={() => setIsPollOpen(true)}
            onSelectContact={() => setIsContactOpen(true)}
            onSelectLocation={() => setIsLocationOpen(true)}
            onSelectEvent={() => setIsEventOpen(true)}
          />

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect}
          />

          <div className="relative flex-1 min-h-[44px] bg-accent/50 rounded-2xl border border-border/50 focus-within:ring-1 focus-within:ring-brand-blue-500/50 focus-within:border-brand-blue-500/50 transition-all flex items-center">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                const val = e.target.value
                if (val === '/' && text === '') {
                  onOpenCommandPalette?.()
                  return
                }
                setText(val)
                onTypingChange?.(val.length > 0)
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none bg-transparent py-3 px-4 outline-none placeholder:text-muted-foreground text-[15px] max-h-32 min-h-[44px] overflow-y-auto scrollbar-thin"
              rows={1}
            />
          </div>

          {text.trim() ? (
            <button
              onClick={handleSendText}
              disabled={disabled}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecording(true)}
              disabled={disabled}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
          
        </div>
      </div>

      <CreatePollDialog 
        open={isPollOpen} 
        onClose={() => setIsPollOpen(false)} 
        onSubmit={handlePollSubmit} 
      />

      <ContactPickerDialog
        open={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        onSelect={handleContactSelect}
        currentUserId={currentUserId}
      />

      <LocationPickerDialog
        open={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        onSelect={handleLocationSelect}
      />

      <CreateEventDialog
        open={isEventOpen}
        onClose={() => setIsEventOpen(false)}
        onSubmit={handleEventSubmit}
      />
    </div>
  )
}
