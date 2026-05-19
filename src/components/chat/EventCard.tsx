'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Calendar as CalendarIcon, MapPin, AlignLeft, Users, Clock, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { EventRow, EventRSVPRow, ProfileLite } from '@/lib/chat/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface EventCardProps {
  messageId: string
  chatId: string
  currentUserId: string
}

export function EventCard({ messageId, chatId, currentUserId }: EventCardProps) {
  const supabase = useMemo(() => createClient(), [])
  const [eventData, setEventData] = useState<EventRow | null>(null)
  const [rsvps, setRsvps] = useState<(EventRSVPRow & { profile: ProfileLite })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let rsvpChannel: any | null = null

    async function loadEvent() {
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('message_id', messageId)
        .single()

      if (!event) {
        if (mounted) setLoading(false)
        return
      }

      if (mounted) setEventData(event)

      const { data: rsvpData } = await supabase
        .from('event_rsvps')
        .select(`
          id, event_id, user_id, status, updated_at,
          profile:profiles!user_id (id, username, display_name, avatar_url)
        `)
        .eq('event_id', event.id)

      if (mounted) {
        setRsvps(
          (rsvpData || []).map((r: any) => ({
            ...r,
            profile: r.profile as ProfileLite,
          }))
        )
        setLoading(false)
      }

      if (!mounted) return

      // Subscribe to RSVP changes for this event id. The unique channel suffix
      // avoids duplicate-topic collisions during React dev remounts.
      if (rsvpChannel) {
        supabase.removeChannel(rsvpChannel)
        rsvpChannel = null
      }

      rsvpChannel = supabase.channel(`event-rsvps-${event.id}-${messageId}-${Date.now()}`)
      rsvpChannel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'event_rsvps', filter: `event_id=eq.${event.id}` },
          (payload: any) => {
            if (!mounted) return
            const row = payload.new || payload.old
            if (!row) return
            // Incremental updates
            setRsvps((prev) => {
              const clone = [...prev]
              if (payload.eventType === 'INSERT') {
                // attach profile may be missing in realtime payload; best-effort
                clone.push({ ...(row as any), profile: (row as any).profile || { id: row.user_id, username: null, display_name: null, avatar_url: null } })
                return clone
              }
              if (payload.eventType === 'UPDATE') {
                return clone.map((r) => (r.id === row.id ? { ...(r as any), status: row.status, updated_at: row.updated_at } : r))
              }
              if (payload.eventType === 'DELETE') {
                return clone.filter((r) => r.id !== row.id)
              }
              return clone
            })
          }
        )
        .subscribe()
    }

    loadEvent()

    return () => {
      mounted = false
      if (rsvpChannel) supabase.removeChannel(rsvpChannel)
    }
  }, [messageId, supabase])

  if (loading) {
    return (
      <div className="flex w-full min-w-[280px] max-w-[360px] animate-pulse flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4">
        <div className="h-6 w-3/4 rounded-lg bg-accent" />
        <div className="h-4 w-1/2 rounded-lg bg-accent" />
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="flex w-full min-w-[280px] max-w-[360px] flex-col rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Event not found or deleted.
      </div>
    )
  }

  const startDate = new Date(eventData.start_time)
  const isPast = startDate.getTime() < Date.now()
  
  const month = startDate.toLocaleString('en-US', { month: 'short' })
  const day = startDate.getDate()
  const timeStr = startDate.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  const myRsvp = rsvps.find((r) => r.user_id === currentUserId)

  const handleRsvp = async (status: 'going' | 'maybe' | 'declined') => {
    try {
      if (myRsvp?.status === status) {
        // Toggle off
        await supabase.from('event_rsvps').delete().eq('id', myRsvp.id)
      } else {
        // Upsert
        await supabase.from('event_rsvps').upsert({
          event_id: eventData.id,
          user_id: currentUserId,
          status,
        }, { onConflict: 'event_id,user_id' })
      }
    } catch (err) {
      console.error('RSVP failed:', err)
    }
  }

  const goingRsvps = rsvps.filter((r) => r.status === 'going')

  function generateICS(event: EventRow | null) {
    if (!event) return ''

    const dtStart = new Date(event.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const dtEnd = event.end_time ? new Date(event.end_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : dtStart

    const uid = event.id + '@kuikchat'
    const summary = event.title.replace(/\n/g, ' ')
    const description = (event.description || '').replace(/\n/g, '\\n')
    const location = event.location || ''

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KuikChat//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
  }

  return (
    <div className={cn(
      "relative flex w-full min-w-[280px] max-w-[380px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all",
      isPast ? "opacity-75 grayscale-[0.3]" : ""
    )}>
      
      {/* Visual Header */}
      <div className="relative h-20 bg-brand-gradient-radial opacity-90 p-4 flex items-start justify-between">
        {/* Date Badge */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-background/95 shadow-md px-3 py-1 backdrop-blur-sm border border-white/20">
          <span className="text-xs font-bold text-brand-blue-500 uppercase">{month}</span>
          <span className="text-xl font-black leading-none text-foreground mt-0.5">{day}</span>
        </div>
      </div>

      <div className="flex flex-col p-4 pt-3 gap-3">
        {/* Title & Time */}
        <div>
          <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-2">
            {eventData.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-blue-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{timeStr}</span>
            {isPast && <span className="text-muted-foreground ml-1 bg-accent px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase">Passed</span>}
          </div>
        </div>

        {/* Location & Desc */}
        {(eventData.location || eventData.description) && (
          <div className="flex flex-col gap-2 rounded-xl bg-accent/30 p-3">
            {eventData.location && (
              <div className="flex items-start gap-2 text-sm text-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="break-words line-clamp-2">{eventData.location}</span>
              </div>
            )}
            {eventData.description && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlignLeft className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="break-words line-clamp-3">{eventData.description}</span>
              </div>
            )}
          </div>
        )}

        {/* RSVP Stats */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {goingRsvps.length} {goingRsvps.length === 1 ? 'person' : 'people'} going
            </span>
          </div>
          
          {/* Avatar Stack */}
          {goingRsvps.length > 0 && (
            <div className="flex -space-x-2">
              {goingRsvps.slice(0, 3).map((r) => (
                <Avatar key={r.id} className="h-6 w-6 border-2 border-card shadow-sm">
                  <AvatarImage src={r.profile.avatar_url || undefined} />
                  <AvatarFallback className="text-[9px]">
                    {getInitials(r.profile.display_name || r.profile.username || '?')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {goingRsvps.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-accent text-[9px] font-medium text-muted-foreground shadow-sm">
                  +{goingRsvps.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons + Meeting / Calendar */}
        {!isPast && (
          <div className="mt-2 grid grid-cols-3 gap-2 border-t pt-3">
            <button
              onClick={() => handleRsvp('going')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all",
                myRsvp?.status === 'going'
                  ? "bg-brand-green-500/15 text-brand-green-600 shadow-sm border border-brand-green-500/30"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Going</span>
            </button>
            <button
              onClick={() => handleRsvp('maybe')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all",
                myRsvp?.status === 'maybe'
                  ? "bg-amber-500/15 text-amber-600 shadow-sm border border-amber-500/30"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Maybe</span>
            </button>
            <button
              onClick={() => handleRsvp('declined')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all",
                myRsvp?.status === 'declined'
                  ? "bg-destructive/15 text-destructive shadow-sm border border-destructive/30"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <XCircle className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Can't Go</span>
            </button>
          </div>
        )}

        {/* Meeting / Calendar Actions */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {eventData?.meeting_link ? (
              <a
                href={eventData.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-brand-blue-500 text-white shadow-sm hover:bg-brand-blue-600"
              >
                Join / Open meeting
              </a>
            ) : null}
          </div>

          <div>
            <button
              onClick={() => {
                // generate ICS and trigger download
                const ics = generateICS(eventData)
                const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${eventData?.title || 'event'}.ics`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              }}
              className="rounded-xl px-3 py-2 text-sm font-semibold bg-accent/60 text-foreground hover:bg-accent"
            >
              Add to calendar
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
