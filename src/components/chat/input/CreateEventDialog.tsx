'use client'

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Calendar, Clock, MapPin, AlignLeft, X, Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EventFormData {
  title: string
  description: string
  location: string
  meetingLink?: string
  startTime: string
  endTime: string
  timezone?: string
}

interface CreateEventDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EventFormData) => void
}

export function CreateEventDialog({ open, onClose, onSubmit }: CreateEventDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [meetingLink, setMeetingLink] = useState('')

  // Set default start time to next hour
  const now = new Date()
  now.setHours(now.getHours() + 1, 0, 0, 0)
  const defaultStart = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  const end = new Date(now)
  end.setHours(end.getHours() + 1)
  const defaultEnd = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  const [startTime, setStartTime] = useState(defaultStart)
  const [endTime, setEndTime] = useState(defaultEnd)
  const [loading, setLoading] = useState(false)

  // Lightweight timezone: default to client tz, but optional only client-side
  const defaultTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  const [timezone] = useState(defaultTZ)

  const isValidUrl = (val: string) => {
    if (!val) return true
    try {
      const u = new URL(val)
      return u.protocol === 'https:' || u.protocol === 'http:'
    } catch (e) {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startTime) return
    if (!isValidUrl(meetingLink)) return alert('Invalid meeting link URL')
    setLoading(true)

    // Convert local datetime-local string to ISO with timezone offset preserved
    const toISOWithTZ = (local: string) => {
      const d = new Date(local)
      return d.toISOString()
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      meetingLink: meetingLink.trim() || undefined,
      startTime: toISOWithTZ(startTime),
      endTime: endTime ? toISOWithTZ(endTime) : '',
      timezone: timezone || undefined,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-4 md:p-0 animate-in zoom-in-95 duration-200 focus:outline-none">
          <div className="flex flex-col overflow-hidden rounded-3xl bg-background shadow-2xl border border-border">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 bg-brand-blue-500/5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue-500 text-white shadow-md shadow-brand-blue-500/20">
                  <Calendar className="h-4 w-4" />
                </div>
                <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">Schedule Event</Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Weekly Team Sync"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm outline-none transition-all focus:border-brand-blue-500 focus:bg-background focus:ring-1 focus:ring-brand-blue-500/50"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Starts</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="datetime-local"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-xl border border-border bg-accent/30 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-brand-blue-500 focus:bg-background dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Ends</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-xl border border-border bg-accent/30 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-brand-blue-500 focus:bg-background dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Location / Link</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Google Meet link or address..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-border bg-accent/30 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-brand-blue-500 focus:bg-background"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Description (Optional)</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      placeholder="Add agenda or notes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border bg-accent/30 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-brand-blue-500 focus:bg-background scrollbar-thin"
                    />
                  </div>
                </div>

                {/* RSVP Note */}
                <div className="flex items-start gap-3 rounded-2xl bg-brand-blue-500/10 p-4 border border-brand-blue-500/20">
                  <Users className="h-5 w-5 text-brand-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">RSVP Tracking Enabled</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Chat members will be able to mark their attendance status.</p>
                  </div>
                </div>
                
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t bg-accent/20 px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="flex items-center gap-2 rounded-xl bg-brand-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-blue-500/20 hover:bg-brand-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </form>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
