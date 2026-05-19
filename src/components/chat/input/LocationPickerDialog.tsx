'use client'

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, MapPin, Navigation, Search, Clock, Shield, ArrowRight, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationPickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (data: { 
    type: 'static' | 'live'
    latitude: number
    longitude: number
    address: string
    durationMinutes?: number 
  }) => void
}

export function LocationPickerDialog({ open, onClose, onSelect }: LocationPickerDialogProps) {
  const [mode, setMode] = useState<'static' | 'live'>('static')
  const [duration, setDuration] = useState(60) // 1 hour default
  const [loading, setLoading] = useState(false)

  const durations = [
    { label: '15 Minutes', value: 15 },
    { label: '1 Hour', value: 60 },
    { label: '8 Hours', value: 480 },
  ]

  const handleShare = () => {
    setLoading(true)
    // Simulate getting location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        onSelect({
          type: mode,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Current Location',
          durationMinutes: mode === 'live' ? duration : undefined
        })
        setLoading(false)
        onClose()
      }, (error) => {
        console.error('Location error', error)
        // Fallback mock for demo
        onSelect({
          type: mode,
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'New York, NY',
          durationMinutes: mode === 'live' ? duration : undefined
        })
        setLoading(false)
        onClose()
      })
    } else {
      // Fallback
      onSelect({
        type: mode,
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
        durationMinutes: mode === 'live' ? duration : undefined
      })
      setLoading(false)
      onClose()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-4 md:p-0 animate-in zoom-in-95 duration-200 focus:outline-none">
          <div className="flex flex-col overflow-hidden rounded-3xl bg-background shadow-2xl border border-border">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue-500/10 text-brand-blue-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">Share Location</Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Simulated Map View */}
            <div className="relative h-48 w-full bg-zinc-900 overflow-hidden group">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
                {/* Simulated Grid/Map Background */}
                <div className="h-full w-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 -m-8 animate-ping rounded-full bg-brand-blue-500/20 [animation-duration:3000ms]" />
                  <div className="absolute inset-0 -m-4 animate-ping rounded-full bg-brand-blue-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-500 shadow-lg shadow-brand-blue-500/40">
                    <Navigation className="h-5 w-5 text-white fill-current" />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-background/80 backdrop-blur-md p-2 border border-white/10 shadow-lg">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-accent flex items-center justify-center">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground/80 truncate">Searching for nearby locations...</p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="p-4 grid grid-cols-2 gap-2 bg-accent/20">
              <button
                onClick={() => setMode('static')}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
                  mode === 'static' 
                    ? "bg-background text-brand-blue-500 shadow-sm border border-border" 
                    : "text-muted-foreground hover:bg-background/50"
                )}
              >
                <MapPin className="h-4 w-4" />
                Current
              </button>
              <button
                onClick={() => setMode('live')}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
                  mode === 'live' 
                    ? "bg-background text-rose-500 shadow-sm border border-border" 
                    : "text-muted-foreground hover:bg-background/50"
                )}
              >
                <Share2 className="h-4 w-4" />
                Live Share
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {mode === 'static' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-accent/10">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-blue-500/10 flex items-center justify-center text-brand-blue-500">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Send your current location</h4>
                      <p className="text-xs text-muted-foreground mt-1">Share your precise coordinates for one-time navigation.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-blue-500 py-4 text-sm font-bold text-white hover:bg-brand-blue-600 transition-all shadow-lg shadow-brand-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? 'Locating...' : 'Send Current Location'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Live Location Sharing</h4>
                      <p className="text-xs text-muted-foreground mt-1">Contacts will see your movement in real-time until the timer expires.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Duration</p>
                    <div className="grid grid-cols-3 gap-2">
                      {durations.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setDuration(d.value)}
                          className={cn(
                            "rounded-xl py-2.5 text-xs font-semibold border transition-all",
                            duration === d.value
                              ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400"
                              : "border-border hover:bg-accent text-muted-foreground"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Privacy: You can stop sharing anytime. End-to-end coordinated.</span>
                  </div>

                  <button
                    onClick={handleShare}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-500 py-4 text-sm font-bold text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? 'Starting...' : 'Start Live Sharing'}
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t bg-accent/20 px-6 py-4 text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Professional Team Coordination
              </p>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
