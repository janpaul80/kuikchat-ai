'use client'

import { useState, useEffect } from 'react'
import {
  Radio,
  Plus,
  Trash2,
  Users,
  Eye,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Heart,
  Palette,
  Loader2,
  UserCheck,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthUser } from '@/hooks/useAuthUser'

interface Status {
  id: string
  user_id: string
  userName: string
  avatar: string | null
  text: string
  background: string
  created_at: string
  visibility: string
  viewers: string[]
  isMine: boolean
}

const GRADIENTS = [
  'from-purple-600 to-blue-500',
  'from-pink-500 to-rose-500',
  'from-green-400 to-teal-600',
  'from-orange-400 to-amber-600',
  'bg-zinc-900',
]

export default function StatusPage() {
  const supabase = createClient()
  const { user } = useAuthUser()

  const [statuses, setStatuses] = useState<Status[]>([])
  const [myStatuses, setMyStatuses] = useState<Status[]>([])
  const [activeStatusId, setActiveStatusId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Composer state
  const [composerOpen, setComposerOpen] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [activeGradient, setActiveGradient] = useState(GRADIENTS[0])
  const [audience, setAudience] = useState<'everyone' | 'contacts' | 'close_friends'>('contacts')
  const [posting, setPosting] = useState(false)

  // Find currently active playing status
  const allStories = [...myStatuses, ...statuses]
  const activeStatus = allStories.find((s) => s.id === activeStatusId) || null

  const fetchStatuses = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Query active statuses (not expired and not archived)
      const { data, error } = await supabase
        .from('statuses')
        .select(`
          id,
          user_id,
          body,
          bg_color,
          created_at,
          visibility,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        // Fetch viewers for all statuses in parallel
        const statusIds = data.map((s) => s.id)
        let viewsMap: Record<string, string[]> = {}
        
        if (statusIds.length > 0) {
          const { data: views, error: viewsErr } = await supabase
            .from('status_views')
            .select(`
              status_id,
              profiles:viewer_id (
                username,
                full_name
              )
            `)
            .in('status_id', statusIds)

          if (!viewsErr && views) {
            views.forEach((v: any) => {
              const prof = (Array.isArray(v.profiles) ? v.profiles[0] : v.profiles) as any
              const name = prof?.full_name || prof?.username || 'Anonymous User'
              if (!viewsMap[v.status_id]) {
                viewsMap[v.status_id] = []
              }
              if (!viewsMap[v.status_id].includes(name)) {
                viewsMap[v.status_id].push(name)
              }
            })
          }
        }

        const mapped: Status[] = data.map((item: any) => {
          const prof = (Array.isArray(item.profiles) ? item.profiles[0] : item.profiles) as any
          return {
            id: item.id,
            user_id: item.user_id,
            userName: prof?.full_name || prof?.username || 'KuikChat User',
            avatar: prof?.avatar_url || null,
            text: item.body || '',
            background: item.bg_color || GRADIENTS[0],
            created_at: item.created_at,
            visibility: item.visibility,
            viewers: viewsMap[item.id] || [],
            isMine: item.user_id === user.id
          }
        })

        setMyStatuses(mapped.filter((s) => s.isMine))
        setStatuses(mapped.filter((s) => !s.isMine))
      }
    } catch (err: any) {
      console.error('[Status] Error loading updates:', err)
      toast.error('Could not load status updates')
    } finally {
      setLoading(false)
    }
  }

  // Load statuses when auth state is ready
  useEffect(() => {
    if (user) {
      fetchStatuses()
    }
  }, [user])

  // Record a view if someone else's status is viewed
  useEffect(() => {
    if (!activeStatus || activeStatus.isMine || !user) return
    
    const recordView = async () => {
      try {
        await supabase
          .from('status_views')
          .insert({
            status_id: activeStatus.id,
            viewer_id: user.id
          })
          // Use upsert or ignore conflict
      } catch (err) {
        // Safe to ignore conflicts if already viewed
      }
    }
    recordView()
  }, [activeStatusId, user])

  const handlePostStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!statusText.trim()) {
      toast.error('Status text cannot be empty')
      return
    }

    setPosting(true)
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      const { data, error } = await supabase
        .from('statuses')
        .insert({
          user_id: user.id,
          type: 'text',
          body: statusText.trim(),
          bg_color: activeGradient,
          visibility: audience,
          expires_at: expiresAt.toISOString()
        })
        .select(`
          id,
          user_id,
          body,
          bg_color,
          created_at,
          visibility,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      if (data) {
        const prof = (Array.isArray(data.profiles) ? data.profiles[0] : data.profiles) as any
        const newStatus: Status = {
          id: data.id,
          user_id: data.user_id,
          userName: prof?.full_name || prof?.username || 'You',
          avatar: prof?.avatar_url || null,
          text: data.body || '',
          background: data.bg_color || GRADIENTS[0],
          created_at: data.created_at,
          visibility: data.visibility,
          viewers: [],
          isMine: true
        }

        setMyStatuses([newStatus, ...myStatuses])
        setStatusText('')
        setComposerOpen(false)
        setActiveStatusId(newStatus.id)
        toast.success('Status posted successfully!')
      }
    } catch (err: any) {
      console.error('[Status] Error posting:', err)
      toast.error('Failed to post status update')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteStatus = async (id: string) => {
    try {
      const { error } = await supabase
        .from('statuses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMyStatuses(myStatuses.filter((s) => s.id !== id))
      if (activeStatusId === id) setActiveStatusId(null)
      toast.success('Status deleted')
    } catch (err: any) {
      console.error('[Status] Error deleting:', err)
      toast.error('Failed to delete status')
    }
  }

  const playNext = () => {
    const currentIndex = allStories.findIndex((s) => s.id === activeStatusId)
    if (currentIndex < allStories.length - 1) {
      setActiveStatusId(allStories[currentIndex + 1].id)
    } else {
      setActiveStatusId(null) // End of stories
    }
  }

  const playPrev = () => {
    const currentIndex = allStories.findIndex((s) => s.id === activeStatusId)
    if (currentIndex > 0) {
      setActiveStatusId(allStories[currentIndex - 1].id)
    }
  }

  // Helper to resolve CSS styling background class or gradient style
  const getGradientStyle = (bgClass: string) => {
    if (bgClass.startsWith('bg-')) return {}
    // e.g. "from-purple-600 to-blue-500" -> linear-gradient(to top right, purple-600, blue-500)
    // We map Tailwind colors roughly to css values for the preview inline style
    const colorsMap: Record<string, string> = {
      'purple-600': '#7c3aed',
      'blue-500': '#3b82f6',
      'pink-500': '#ec4899',
      'rose-500': '#f43f5e',
      'green-400': '#4ade80',
      'teal-600': '#0d9488',
      'orange-400': '#fb923c',
      'amber-600': '#d97706',
    }
    const cleanColors = bgClass.split(' ').map((c) => {
      const key = c.replace('from-', '').replace('to-', '')
      return colorsMap[key] || '#18181b'
    })
    return {
      backgroundImage: `linear-gradient(135deg, ${cleanColors.join(', ')})`
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground md:flex-row">
      {/* Left Pane: My Status & Friends List */}
      <div className="w-full md:w-80 border-r border-border bg-card/10 flex flex-col shrink-0">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-brand-blue-500 animate-pulse" />
              <h1 className="text-lg font-bold">Status updates</h1>
            </div>
            <Button size="sm" variant="gradient" onClick={() => setComposerOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Post Status
            </Button>
          </div>

          {/* Audience Control */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Default Privacy</Label>
            <div className="flex gap-1.5">
              {[
                { id: 'everyone', label: 'Everyone', icon: Globe },
                { id: 'contacts', label: 'Contacts', icon: Users },
                { id: 'close_friends', label: 'Close Friends', icon: UserCheck },
              ].map((aud) => {
                const Icon = aud.icon
                const active = audience === aud.id
                return (
                  <Button
                    key={aud.id}
                    size="xs"
                    variant={active ? 'gradient' : 'outline'}
                    onClick={() => {
                      setAudience(aud.id as any)
                      toast.success(`Audience set to: ${aud.label}`)
                    }}
                    className="text-[9px] py-1 flex-1"
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {aud.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Status list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-blue-500" />
            </div>
          ) : (
            <>
              {/* My Status Section */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase text-muted-foreground px-1">My Updates</h3>
                {myStatuses.length === 0 ? (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border bg-card/20 cursor-pointer hover:bg-card/40 transition-colors"
                    onClick={() => setComposerOpen(true)}
                  >
                    <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground bg-background">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Share your status</p>
                      <p className="text-[10px] text-muted-foreground">Disappears after 24h</p>
                    </div>
                  </div>
                ) : (
                  myStatuses.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        activeStatusId === s.id
                          ? 'border-brand-blue-500 bg-brand-blue-500/5'
                          : 'border-border bg-card hover:bg-card/80'
                      }`}
                      onClick={() => setActiveStatusId(s.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-8 w-8 rounded-full shrink-0 ${s.background.startsWith('bg-') ? s.background : ''}`} style={getGradientStyle(s.background)} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{s.text}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {s.viewers.length} views
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteStatus(s.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Friends Status Section */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase text-muted-foreground px-1">Recent Updates</h3>
                {statuses.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">No recent updates.</p>
                ) : (
                  statuses.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                        activeStatusId === s.id
                          ? 'border-brand-blue-500 bg-brand-blue-500/5'
                          : 'border-border bg-card hover:bg-card/80'
                      }`}
                      onClick={() => setActiveStatusId(s.id)}
                    >
                      <div className={`h-9 w-9 rounded-full shrink-0 ring-2 ring-brand-blue-500 ring-offset-2 ring-offset-card ${s.background.startsWith('bg-') ? s.background : ''}`} style={getGradientStyle(s.background)} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">{s.userName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{s.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center Column: Full-Screen Story Player */}
      <div className="flex-1 bg-black/95 flex flex-col items-center justify-center p-6 relative">
        {activeStatus ? (
          <div 
            className={`w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden flex flex-col justify-between p-6 shadow-2xl relative ${activeStatus.background.startsWith('bg-') ? activeStatus.background : ''}`} 
            style={getGradientStyle(activeStatus.background)}
          >
            {/* Player Progress Bars */}
            <div className="flex gap-1.5 absolute top-4 left-4 right-4 z-10">
              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-full animate-story-progress" />
              </div>
            </div>

            {/* Top Bar info */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-xs">
                  {activeStatus.userName[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{activeStatus.userName}</p>
                  <p className="text-[9px] text-white/70">Posted status</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] border-white/20 text-white bg-black/20">
                24h Status
              </Badge>
            </div>

            {/* Story Text Content */}
            <div className="flex-1 flex items-center justify-center text-center px-4 py-8">
              <p className="text-lg font-bold text-white leading-relaxed drop-shadow">
                {activeStatus.text}
              </p>
            </div>

            {/* Playback Controls & Info */}
            <div className="flex items-center justify-between z-10">
              <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10" onClick={playPrev}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              {activeStatus.isMine ? (
                <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full text-xs text-white border border-white/10">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{activeStatus.viewers.length} Views</span>
                </div>
              ) : (
                <Input
                  placeholder="Send a reply..."
                  className="bg-black/40 border-white/10 text-xs text-white placeholder-white/50 h-8 rounded-full max-w-[160px]"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const replyText = (e.target as any).value?.trim()
                      if (!replyText || !user) return
                      
                      try {
                        // Insert status reply record
                        await supabase
                          .from('status_replies')
                          .insert({
                            status_id: activeStatus.id,
                            user_id: user.id,
                            body: replyText
                          })

                        // Also send a private direct message to the user
                        // We resolve the private conversation between us
                        const { data: conv } = await supabase
                          .rpc('get_or_create_conversation', {
                            other_user_id: activeStatus.user_id
                          })
                        
                        if (conv) {
                          await supabase
                            .from('messages')
                            .insert({
                              conversation_id: conv,
                              sender_id: user.id,
                              body: `Replied to your status: "${activeStatus.text}"\n\n${replyText}`
                            })
                        }

                        toast.success(`Reply sent to ${activeStatus.userName}`)
                        ;(e.target as any).value = ''
                      } catch (err) {
                        toast.error('Failed to send status reply')
                      }
                    }
                  }}
                />
              )}
              <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10" onClick={playNext}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Viewers Drawer for my status */}
            {activeStatus.isMine && activeStatus.viewers.length > 0 && (
              <div className="absolute bottom-16 left-4 right-4 bg-black/60 border border-white/10 rounded-xl p-3 text-[10px] text-white/90">
                <span className="font-semibold block mb-1">Viewed by:</span>
                <p className="truncate">{activeStatus.viewers.join(', ')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <p>Select a contact status update to view it.</p>
          </div>
        )}
      </div>

      {/* Composer Dialog */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-sm">Post text status</h3>

            <form onSubmit={handlePostStatus} className="space-y-4">
              <div className={`w-full aspect-[4/3] rounded-xl p-4 flex flex-col justify-between ${activeGradient.startsWith('bg-') ? activeGradient : ''}`} style={getGradientStyle(activeGradient)}>
                <textarea
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="Type status message..."
                  className="flex-1 bg-transparent text-white border-none outline-none resize-none placeholder-white/60 font-semibold text-center text-sm flex items-center justify-center focus:ring-0 focus:outline-none"
                  rows={4}
                  maxLength={150}
                />
                <span className="text-[9px] text-white/60 text-right">
                  {statusText.length}/150
                </span>
              </div>

              {/* Background Color Pickers */}
              <div className="space-y-1.5">
                <Label className="text-xs">Select Background</Label>
                <div className="flex gap-2">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setActiveGradient(g)}
                      className={`h-8 w-8 rounded-full transition-all ring-offset-background ${g.startsWith('bg-') ? g : ''} ${
                        activeGradient === g ? 'ring-2 ring-foreground' : 'hover:scale-105'
                      }`}
                      style={getGradientStyle(g)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setComposerOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="gradient" type="submit" disabled={posting}>
                  {posting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Post Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
