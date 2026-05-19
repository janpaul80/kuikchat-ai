'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { MapPin, Navigation, ExternalLink, Share2, Clock, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { LiveLocationSessionRow } from '@/lib/chat/types'

interface LocationCardProps {
  type: 'static' | 'live'
  latitude: number
  longitude: number
  address: string
  messageId: string
  mine: boolean
  currentUserId: string
  expiresAt?: string
}

export function LocationCard({ type, latitude, longitude, address, messageId, mine, currentUserId, expiresAt }: LocationCardProps) {
  const [session, setSession] = useState<LiveLocationSessionRow | null>(null)
  const [loading, setLoading] = useState(type === 'live')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (type !== 'live') return

    async function loadSession() {
      const { data } = await supabase
        .from('live_location_sessions')
        .select('*')
        .eq('message_id', messageId)
        .maybeSingle()
      
      if (data) {
        setSession(data as LiveLocationSessionRow)
      }
      setLoading(false)
    }

    loadSession()

    // Realtime subscription for live location
    const channel = supabase
      .channel(`live_loc_${messageId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'live_location_sessions',
        filter: `message_id=eq.${messageId}`
      }, (payload) => {
        setSession(payload.new as LiveLocationSessionRow)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [type, messageId, supabase])

  const handleOpenMap = () => {
    const lat = session?.latitude ?? latitude
    const lon = session?.longitude ?? longitude
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank')
  }

  const handleStopSharing = async () => {
    if (!session || session.user_id !== currentUserId) return
    await supabase
      .from('live_location_sessions')
      .update({ is_active: false })
      .eq('id', session.id)
  }

  const isActive = type === 'live' && session?.is_active && new Date(session.expires_at) > new Date()
  const displayLat = session?.latitude ?? latitude
  const displayLon = session?.longitude ?? longitude

  return (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md min-w-[260px] max-w-[300px]",
      mine 
        ? "bg-white/10 border-white/20 text-white" 
        : "bg-background border-border text-foreground"
    )}>
      {/* Map Preview Placeholder */}
      <div className="relative h-32 w-full bg-zinc-900 overflow-hidden group cursor-pointer" onClick={handleOpenMap}>
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="h-full w-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:15px_15px]" />
        </div>
        
        {/* Animated Radar for Live */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-20 w-20 animate-ping rounded-full bg-rose-500/20 [animation-duration:3000ms]" />
            <div className="h-12 w-12 animate-ping rounded-full bg-rose-500/30" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-110",
            isActive ? "bg-rose-500" : "bg-brand-blue-500"
          )}>
            <MapPin className="h-4 w-4 text-white fill-current" />
          </div>
        </div>

        <div className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
          {displayLat.toFixed(4)}, {displayLon.toFixed(4)}
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold truncate leading-tight">
              {type === 'live' ? 'Live Location' : 'Current Location'}
            </p>
            <p className={cn(
              "text-[11px] truncate mt-0.5",
              mine ? "text-white/60" : "text-muted-foreground"
            )}>
              {address}
            </p>
          </div>
          {type === 'live' && (
            <div className={cn(
              "flex h-5 items-center gap-1.5 rounded-full px-2 text-[9px] font-black uppercase tracking-wider",
              isActive 
                ? "bg-rose-500/20 text-rose-500 animate-pulse" 
                : "bg-zinc-500/20 text-zinc-500"
            )}>
              <div className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "bg-zinc-500")} />
              {isActive ? 'Live' : 'Ended'}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleOpenMap}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all active:scale-95",
              mine 
                ? "bg-white/10 hover:bg-white/20 text-white border border-white/5" 
                : "bg-accent/50 hover:bg-accent text-foreground border border-border/50"
            )}
          >
            <Navigation className="h-3.5 w-3.5" />
            Open in Maps
          </button>

          {isActive && mine && (
            <button
              onClick={handleStopSharing}
              className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all active:scale-95"
            >
              <Ban className="h-3.5 w-3.5" />
              Stop Sharing
            </button>
          )}
        </div>

        {isActive && (
          <div className={cn(
            "flex items-center gap-2 text-[10px] font-medium px-1",
            mine ? "text-white/40" : "text-muted-foreground/60"
          )}>
            <Clock className="h-3 w-3" />
            <span>Updates every few seconds</span>
          </div>
        )}
      </div>
    </div>
  )
}
