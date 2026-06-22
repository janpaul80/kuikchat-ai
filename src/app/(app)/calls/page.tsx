'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Phone,
  Video,
  PhoneOff,
  PhoneCall,
  VolumeX,
  Volume2,
  VideoOff,
  Monitor,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Clock,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { WebRTCStub } from '@/lib/calls/webrtcStub'
import { toast } from 'sonner'

interface CallLog {
  id: string
  contactName: string
  type: 'voice' | 'video'
  direction: 'incoming' | 'outgoing' | 'missed'
  duration: string
  timestamp: string
}

interface Contact {
  id: string
  display_name: string
  username: string
  avatar_url: string | null
}

const INITIAL_CALLS: CallLog[] = []

export default function CallsPage() {
  const supabase = createClient()
  const [callLogs, setCallLogs] = useState<CallLog[]>(INITIAL_CALLS)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Dialer & Call States
  const [showDialer, setShowDialer] = useState(false)
  const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null)
  const [callType, setCallType] = useState<'voice' | 'video'>('voice')
  const [callState, setCallState] = useState<string>('disconnected') // disconnected, connecting, ringing, connected
  const [callDuration, setCallDuration] = useState(0)

  // Call Mutes & Screensharing
  const [micMuted, setMicMuted] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)

  const rtcStubRef = useRef<WebRTCStub | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function loadContacts() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch user contacts profiles
        const { data, error } = await supabase
          .from('contacts')
          .select('profile:profiles!contacts_contact_id_fkey(id, username, display_name, avatar_url)')
          .eq('user_id', user.id)

        if (data) {
          const list = data.map((x: any) => x.profile).filter(Boolean) as Contact[]
          setContacts(list)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadContacts()
  }, [])

  // Call Timer Effect
  useEffect(() => {
    if (callState === 'connected') {
      setCallDuration(0)
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [callState])

  const handleStartCall = async (contact: Contact, type: 'voice' | 'video') => {
    setActiveCallContact(contact)
    setCallType(type)
    setShowDialer(false)

    // Instantiate and trigger transport stub
    const stub = new WebRTCStub(contact.id, (state) => {
      setCallState(state)
      if (state === 'disconnected') {
        setActiveCallContact(null)
      }
    })
    rtcStubRef.current = stub

    toast.info(`Dialing ${contact.display_name}...`)
    await stub.startCall({
      video: type === 'video',
      audio: true,
    })
  }

  const handleEndCall = () => {
    if (rtcStubRef.current) {
      // Append to mock call log
      if (activeCallContact) {
        const newLog: CallLog = {
          id: `log-${Date.now()}`,
          contactName: activeCallContact.display_name,
          type: callType,
          direction: 'outgoing',
          duration: callState === 'connected' ? formatDuration(callDuration) : '--',
          timestamp: new Date().toISOString(),
        }
        setCallLogs([newLog, ...callLogs])
      }

      rtcStubRef.current.endCall()
      rtcStubRef.current = null
    }
    setCallState('disconnected')
    setActiveCallContact(null)
    setMicMuted(false)
    setVideoMuted(false)
    setScreenSharing(false)
    toast.success('Call ended')
  }

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s < 10 ? '0' : ''}${s}s`
  }

  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const filteredLogs = callLogs.filter((log) =>
    log.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground md:flex-row relative">
      {/* Left Pane: Call History List */}
      <div className="flex-1 flex flex-col border-r border-border bg-card/10 overflow-hidden">
        <div className="p-4 border-b border-border space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-brand-blue-500" />
              <h1 className="text-lg font-bold">Calls log</h1>
            </div>
            <Button size="sm" variant="gradient" onClick={() => setShowDialer(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Call
            </Button>
          </div>

          {/* Search Logs */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search call logs..."
              className="pl-9 bg-card"
            />
          </div>
        </div>

        {/* Logs list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 mt-12">
              <Phone className="h-10 w-10 text-muted-foreground opacity-30" />
              <p className="text-sm font-medium text-foreground">No calls yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                You haven't made or received any calls on KuikChat.
              </p>
              <Button size="sm" variant="outline" onClick={() => setShowDialer(true)}>
                Start a call
              </Button>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const directionIcon =
                log.direction === 'outgoing' ? (
                  <ArrowUpRight className="h-4 w-4 text-brand-green-500" />
                ) : log.direction === 'incoming' ? (
                  <ArrowDownLeft className="h-4 w-4 text-brand-blue-500" />
                ) : (
                  <PhoneOff className="h-4 w-4 text-destructive" />
                )
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
                      {log.contactName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{log.contactName}</span>
                        {log.type === 'video' ? (
                          <Video className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        {directionIcon}
                        <span>{log.direction} • {log.duration}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Column/Center Column Placeholder */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-card/5 text-center text-xs text-muted-foreground space-y-2 flex-col p-6 shrink-0">
        <PhoneCall className="h-12 w-12 text-muted-foreground opacity-30 animate-pulse" />
        <p>No active call. Start a new voice or video call with a contact.</p>
      </div>

      {/* Dialer dialog */}
      {showDialer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Start call</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowDialer(false)}>
                Cancel
              </Button>
            </div>

            <div className="divide-y divide-border max-h-60 overflow-y-auto pr-1">
              {contacts.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">Add contacts to start calling.</p>
              ) : (
                contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{c.display_name}</p>
                      <p className="text-muted-foreground text-[10px]">@{c.username}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-brand-green-500 hover:bg-brand-green-500/10" onClick={() => handleStartCall(c, 'voice')}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-brand-blue-500 hover:bg-brand-blue-500/10" onClick={() => handleStartCall(c, 'video')}>
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Dialer / Active Call Overlay */}
      {activeCallContact && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-8 text-white">
          {/* Top Row: User details */}
          <div className="text-center mt-12 space-y-3">
            <div className="h-24 w-24 rounded-full bg-brand-gradient mx-auto flex items-center justify-center font-bold text-white text-3xl">
              {activeCallContact.display_name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">{activeCallContact.display_name}</h2>
              <p className="text-xs text-muted-foreground">@{activeCallContact.username}</p>
            </div>
            <Badge variant="outline" className="text-xs text-white bg-black/30 border-white/20 capitalize">
              {callState} ({callType} call)
            </Badge>
          </div>

          {/* Center: Timer / Video Stub */}
          <div className="flex-1 flex items-center justify-center">
            {callState === 'connected' ? (
              <div className="text-center space-y-2">
                <p className="text-5xl font-mono tracking-wider font-light">
                  {formatDuration(callDuration).replace('m', ':').replace('s', '').replace(' ', '')}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Connected</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-brand-blue-500" />
                <p className="text-xs text-muted-foreground capitalize">Establishing link...</p>
              </div>
            )}
          </div>

          {/* Bottom Row: Call Controls */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              size="icon"
              variant="outline"
              className={`h-12 w-12 rounded-full border-white/10 ${micMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
              onClick={() => {
                setMicMuted(!micMuted)
                toast.success(micMuted ? 'Microphone active' : 'Microphone muted')
              }}
            >
              {micMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <Button
              size="icon"
              variant="outline"
              className={`h-12 w-12 rounded-full border-white/10 ${videoMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
              onClick={() => {
                setVideoMuted(!videoMuted)
                toast.success(videoMuted ? 'Video active' : 'Video stopped')
              }}
            >
              {videoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>

            <Button
              size="icon"
              variant="outline"
              className={`h-12 w-12 rounded-full border-white/10 ${screenSharing ? 'bg-brand-blue-500/20 text-brand-blue-500 hover:bg-brand-blue-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
              onClick={() => {
                setScreenSharing(!screenSharing)
                toast.success(screenSharing ? 'Screen sharing stopped' : 'Screen sharing active')
              }}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="default"
              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
