'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Settings,
  MessageSquare,
  VolumeX,
  Shield,
  Clock,
  ChevronRight,
  Hash,
  Crown,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface Channel {
  id: string
  name: string
  isAnnouncements: boolean
}

interface Member {
  id: string
  name: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  title: string
}

interface Community {
  id: string
  name: string
  channels: Channel[]
  members: Member[]
}

const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'c1',
    name: 'KuikChat Open Source',
    channels: [
      { id: 'ch1', name: 'general', isAnnouncements: false },
      { id: 'ch2', name: 'announcements', isAnnouncements: true },
      { id: 'ch3', name: 'releases', isAnnouncements: false },
    ],
    members: [
      { id: 'm1', name: 'Alex Johnson', role: 'owner', title: 'Lead Architect' },
      { id: 'm2', name: 'Sarah Miller', role: 'admin', title: 'Community Manager' },
      { id: 'm3', name: 'David Chen', role: 'moderator', title: 'Developer' },
      { id: 'm4', name: 'Elena Rostova', role: 'member', title: 'Contributor' },
    ],
  },
  {
    id: 'c2',
    name: 'Design Hub',
    channels: [
      { id: 'ch4', name: 'inspiration', isAnnouncements: false },
      { id: 'ch5', name: 'critique', isAnnouncements: false },
      { id: 'ch6', name: 'announcements', isAnnouncements: true },
    ],
    members: [
      { id: 'm5', name: 'Marcus Aurelius', role: 'owner', title: 'Product Lead' },
      { id: 'm6', name: 'Juliet Capulet', role: 'admin', title: 'UI Designer' },
    ],
  },
]

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES)
  const [activeCommunityId, setActiveCommunityId] = useState('c1')
  const [activeChannelId, setActiveChannelId] = useState('ch1')

  // Create Channel Form State
  const [newChannelName, setNewChannelName] = useState('')
  const [isAnnouncementsOnly, setIsAnnouncementsOnly] = useState(false)

  // Moderation Settings State
  const [slowMode, setSlowMode] = useState(false)
  const [announcementMode, setAnnouncementMode] = useState(false)
  const [bannedWords, setBannedWords] = useState('crypto, spam, coupon')

  // Find active community and channel
  const activeCommunity = communities.find((c) => c.id === activeCommunityId) || communities[0]
  const activeChannel = activeCommunity.channels.find((ch) => ch.id === activeChannelId) || activeCommunity.channels[0]

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim()) {
      toast.error('Channel name is required')
      return
    }

    const cleanedName = newChannelName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const newChan: Channel = {
      id: `ch-${Date.now()}`,
      name: cleanedName,
      isAnnouncements: isAnnouncementsOnly,
    }

    setCommunities(
      communities.map((c) => {
        if (c.id === activeCommunityId) {
          return {
            ...c,
            channels: [...c.channels, newChan],
          };
        }
        return c
      })
    )

    setNewChannelName('')
    setIsAnnouncementsOnly(false)
    setActiveChannelId(newChan.id)
    toast.success(`Channel #${cleanedName} created!`)
  }

  const handleToggleSlowMode = (checked: boolean) => {
    setSlowMode(checked)
    toast.success(checked ? 'Slow mode enabled (15s)' : 'Slow mode disabled')
  }

  const handleToggleAnnouncementMode = (checked: boolean) => {
    setAnnouncementMode(checked)
    toast.success(checked ? 'Announcement-only mode enabled' : 'Announcement-only mode disabled')
  }

  const handleSaveBannedWords = () => {
    toast.success('Banned words filter updated')
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground md:flex-row overflow-hidden">
      {/* Sidebar Panel: Communities & Channels */}
      <div className="w-full md:w-64 border-r border-border bg-card/10 flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-blue-500" />
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Communities
            </h1>
          </div>
          {/* Community Switcher */}
          <select
            value={activeCommunityId}
            onChange={(e) => {
              setActiveCommunityId(e.target.value)
              const comm = communities.find((c) => c.id === e.target.value)
              if (comm && comm.channels[0]) {
                setActiveChannelId(comm.channels[0].id)
              }
            }}
            className="w-full mt-3 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-groups (Channels) list */}
        <div className="flex-1 p-2 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Channels</span>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="space-y-1">
                {activeCommunity.channels.map((ch) => {
                  const isActive = ch.id === activeChannelId
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannelId(ch.id)}
                      className={`flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-gradient text-white'
                          : 'text-muted-foreground hover:bg-card hover:text-foreground'
                      }`}
                    >
                      <Hash className="h-4 w-4 shrink-0" />
                      <span className="truncate">{ch.name}</span>
                      {ch.isAnnouncements && (
                        <Badge variant="outline" className="ml-auto text-[8px] border-none bg-white/20 text-white">
                          Broadcast
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="border-t border-border/60 pt-3 px-2">
            <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Create Channel</h4>
            <form onSubmit={handleCreateChannel} className="space-y-2">
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="new-channel"
                className="h-8 text-xs bg-card"
              />
              <div className="flex items-center justify-between text-[11px] px-1 py-1">
                <span className="text-muted-foreground">Broadcast-Only</span>
                <Switch checked={isAnnouncementsOnly} onCheckedChange={setIsAnnouncementsOnly} />
              </div>
              <Button type="submit" size="xs" variant="outline" className="w-full text-xs">
                Create
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Panel: Group Channel Mock Preview */}
      <div className="flex-1 flex flex-col border-r border-border bg-card/5">
        <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-1">
              <Hash className="h-4 w-4 text-brand-blue-500" />
              {activeChannel?.name || 'general'}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Welcome to the beginning of the #{activeChannel?.name || 'general'} channel.
            </p>
          </div>
        </div>

        {/* Mock Group Chat Feed displaying custom role badges next to users */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-thin">
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground max-w-md mx-auto">
            This is a preview representation of the collaborative Communities layout. Role badges correspond to users in `public.team_seats`.
          </div>

          <div className="space-y-3">
            {[
              { sender: 'Alex Johnson', role: 'owner', text: 'Welcome everyone! We are launching our new update tonight.', time: '08:30 AM' },
              { sender: 'Sarah Miller', role: 'admin', text: 'All release pipelines are green and verified.', time: '08:31 AM' },
              { sender: 'David Chen', role: 'moderator', text: 'I will monitor the support queues for any reports.', time: '08:34 AM' },
              { sender: 'Elena Rostova', role: 'member', text: 'Excited! Thanks for the hard work team.', time: '08:35 AM' },
            ].map((msg, i) => {
              const roleColors = {
                owner: 'bg-red-500/10 text-red-500 border-red-500/20',
                admin: 'bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20',
                moderator: 'bg-brand-green-500/10 text-brand-green-500 border-brand-green-500/20',
                member: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
              }
              return (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="h-8 w-8 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold shrink-0">
                    {msg.sender[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-foreground">{msg.sender}</span>
                      <Badge variant="outline" className={`text-[9px] px-1 capitalize py-0 ${roleColors[msg.role as keyof typeof roleColors]}`}>
                        {msg.role}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-[13px]">{msg.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Settings Pane: Community Settings & Moderation */}
      <div className="w-full md:w-72 p-6 bg-card shrink-0 space-y-6 overflow-y-auto scrollbar-thin">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-4">
            <Shield className="h-4 w-4 text-brand-blue-500" />
            Moderation Controls
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Slow Mode</p>
                <p className="text-[10px] text-muted-foreground">Limits message rate to 15s</p>
              </div>
              <Switch checked={slowMode} onCheckedChange={handleToggleSlowMode} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Announcement Only</p>
                <p className="text-[10px] text-muted-foreground">Only Admins can send messages</p>
              </div>
              <Switch checked={announcementMode} onCheckedChange={handleToggleAnnouncementMode} />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="bannedWords" className="text-xs">Banned Words Filter</Label>
              <Input
                id="bannedWords"
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                placeholder="comma, separated, words"
                className="bg-background h-8 text-xs"
              />
              <Button size="xs" variant="outline" className="w-full mt-1.5" onClick={handleSaveBannedWords}>
                Save Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Member directory with role assignment details */}
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3">
            <Users className="h-4 w-4 text-brand-green-500" />
            Members ({activeCommunity.members.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activeCommunity.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs py-1">
                <div>
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.title}</p>
                </div>
                <Badge variant="outline" className="text-[8px] px-1 capitalize shrink-0">
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
