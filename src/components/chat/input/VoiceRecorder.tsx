'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Trash2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, durationMs: number) => void
  onCancel: () => void
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Start recording immediately when component mounts
    startRecording()
    return () => {
      cleanup()
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        // We handle the blob processing in the stop function called by user
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Microphone access denied:', err)
      onCancel()
    }
  }

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleStopAndSend = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return
    
    // Override the onstop to send the blob immediately
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      onSend(blob, duration * 1000)
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
    }
    
    cleanup()
    setIsRecording(false)
  }

  const handleCancel = () => {
    cleanup()
    setIsRecording(false)
    onCancel()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex h-12 w-full items-center justify-between rounded-full bg-accent/50 px-4 ring-1 ring-border"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="h-2.5 w-2.5 rounded-full bg-red-500"
        />
        <span className="font-mono text-sm font-medium text-foreground w-12">
          {formatTime(duration)}
        </span>
      </div>

      {/* Slide to cancel indicator (visual only for web MVP, real gesture on mobile) */}
      <div className="flex-1 text-center">
        <span className="text-xs text-muted-foreground animate-pulse">
          Recording...
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleCancel}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleStopAndSend}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
