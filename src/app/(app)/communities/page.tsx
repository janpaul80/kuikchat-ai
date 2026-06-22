'use client'

import { useEffect, useState, useRef } from 'react'
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
  Send,
  Loader2,
  Lock,
  Unlock,
  CheckCircle,
  PlusCircle,
  Megaphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Community {
  id: string
  slug: string
  name: string
  description: string | null
  owner_id: string
  is_public: boolean
  is_verified: boolean
  member_count: number
}

interface CommunityChat {
  id: string
  name: string
  description: string | null
  type: 'direct' | 'group' | 'hermes' | 'self'
  announcement_only: boolean
  slow_mode_seconds: number
}

interface Message {
  id: string
  chat_id: string
  sender_id: string | null
  body: string | null
  created_at: string
  sender?: {
    display_name: string
    username: string
    avatar_url: string | null
  }
}

interface Member {
  user_id: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  profile: {
    display_name: string
    username: string
    avatar_url: string | null
  }
}

export default function CommunitiesPage() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [communities, setCommunities] = useState<Community[]>([])
  const [activeCommunityId, setActiveCommunityId] = useState<string>('')
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([])

  const [channels, setChannels] = useState<CommunityChat[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string>('')

  // Message feed
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessageText, setNewMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messageEndRef = useRef<HTMLDivElement | null>(null)

  // Creation form state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createDesc, setCreateDesc] = useState('Hi everyone! This community is for members to chat in topic-based groups and get important announcements.')
  const [creating, setCreating] = useState(false)

  // Members list
  const [members, setMembers] = useState<Member[]>([])

  // Moderation settings
  const [slowMode, setSlowMode] = useState(false)
  const [announcementMode, setAnnouncementMode] = useState(false)
  const [bannedWords, setBannedWords] = useState('crypto, spam, coupon')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setCurrentUser(user)

        await loadCommunities(user.id)
      } catch (err) {
        console.error('Error during community initialization:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Auto-slugify name during creation
  useEffect(() => {
    const slugified = createName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setCreateSlug(slugified)
  }, [createName])

  // Load sub-channels, members, and messages whenever active community changes
  useEffect(() => {
    if (!activeCommunityId) return
    loadCommunityChannels(activeCommunityId)
    loadCommunityMembers(activeCommunityId)
  }, [activeCommunityId])

  // Load messages whenever active channel changes
  useEffect(() => {
    if (!activeChannelId) {
      setMessages([])
      return
    }
    loadChannelMessages(activeChannelId)

    // Subscribe to realtime messages in this channel
    const channelSubscription = supabase
      .channel(`chat-messages-${activeChannelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${activeChannelId}`,
        },
        async (payload) => {
          // Fetch sender info for new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username, avatar_url')
            .eq('id', payload.new.sender_id)
            .single()

          const newMsg: Message = {
            id: payload.new.id,
            chat_id: payload.new.chat_id,
            sender_id: payload.new.sender_id,
            body: payload.new.body,
            created_at: payload.new.created_at,
            sender: profile || {
              display_name: 'Unknown User',
              username: 'unknown',
              avatar_url: null,
            },
          }
          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelSubscription)
    }
  }, [activeChannelId])

  // Auto-scroll messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadCommunities = async (userId: string) => {
    const officialSlugs = ['kuikchat-global', 'ai-assistants', 'developer-lounge', 'design-ux']
    const hubs = [
      {
        slug: 'kuikchat-global',
        name: 'KuikChat Global',
        description: 'The official global hub for KuikChat users. Connect, share, and chat with the world!',
        is_verified: true,
      },
      {
        slug: 'ai-assistants',
        name: 'AI Assistants & Agents',
        description: 'Explore and discuss the latest in agentic AI, Hermes integrations, and model customization.',
        is_verified: true,
      },
      {
        slug: 'developer-lounge',
        name: 'Developer Lounge',
        description: 'Share your code, debug integrations, and collaborate on the KuikChat open-source platform.',
        is_verified: true,
      },
      {
        slug: 'design-ux',
        name: 'Design & UX',
        description: 'Discuss design systems, UI animations, styling, and modern user experiences.',
        is_verified: true,
      }
    ]

    try {
      for (const hub of hubs) {
        const { data: existing } = await supabase
          .from('communities')
          .select('id')
          .eq('slug', hub.slug)
          .maybeSingle()

        if (!existing) {
          const { data: comm } = await supabase
            .from('communities')
            .insert({
              slug: hub.slug,
              name: hub.name,
              description: hub.description,
              owner_id: userId,
              is_public: true,
              is_verified: hub.is_verified,
            })
            .select()
            .single()

          if (comm) {
            await supabase
              .from('community_members')
              .insert({ community_id: comm.id, user_id: userId, role: 'owner' })
              .maybeSingle()

            const channelsToCreate = [
              { name: 'general', desc: 'General community discussion and chat' },
              { name: 'announcements', desc: 'Official updates from the owner', announcement_only: true },
              { name: 'help', desc: 'Q&A and help support' },
            ]

            for (const chan of channelsToCreate) {
              const { data: chat } = await supabase
                .from('chats')
                .insert({
                  type: 'group',
                  name: chan.name,
                  description: chan.desc,
                  created_by: userId,
                  is_public: true,
                  community_id: comm.id,
                  announcement_only: chan.announcement_only || false,
                })
                .select()
                .single()

              if (chat) {
                await supabase
                  .from('chat_members')
                  .insert({ chat_id: chat.id, user_id: userId, role: 'owner' })
                  .maybeSingle()
              }
            }
          }
        }
      }
    } catch (seedErr) {
      console.error('Seeding curated communities failed:', seedErr)
    }

    const { data: comms, error } = await supabase
      .from('communities')
      .select('*')
      .in('slug', officialSlugs)

    if (error) {
      console.error('Error fetching communities:', error)
      return
    }

    const finalComms = comms || []
    setCommunities(finalComms)

    // Fetch joined community ids
    const { data: joined } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', userId)

    const joinedIds = (joined || []).map((j) => j.community_id)
    setJoinedCommunities(joinedIds)

    if (finalComms.length > 0) {
      const found = finalComms.find(c => c.id === activeCommunityId)
      if (!found) {
        setActiveCommunityId(finalComms[0].id)
      }
    }
  }

  const loadCommunityChannels = async (communityId: string) => {
    const { data, error } = await supabase
      .from('chats')
      .select('id, name, description, type, announcement_only, slow_mode_seconds')
      .eq('community_id', communityId)

    if (error) {
      console.error('Error fetching community channels:', error)
      return
    }

    const sorted = (data || []).sort((a, b) => {
      if (a.announcement_only && !b.announcement_only) return -1
      if (!a.announcement_only && b.announcement_only) return 1
      return a.name.localeCompare(b.name)
    })

    setChannels(sorted)
    if (sorted.length > 0) {
      setActiveChannelId(sorted[0].id)
      setSlowMode(sorted[0].slow_mode_seconds > 0)
      setAnnouncementMode(sorted[0].announcement_only)
    } else {
      setActiveChannelId('')
    }
  }

  const loadCommunityMembers = async (communityId: string) => {
    // Select members of the community along with their profile metadata
    const { data, error } = await supabase
      .from('community_members')
      .select('user_id, role, profile:profiles(display_name, username, avatar_url)')
      .eq('community_id', communityId)

    if (error) {
      console.error('Error loading community members:', error)
      return
    }

    setMembers(data as any || [])
  }

  const loadChannelMessages = async (channelId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, chat_id, sender_id, body, created_at, sender:profiles(display_name, username, avatar_url)')
      .eq('chat_id', channelId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading channel messages:', error)
      return
    }
    setMessages(data as any || [])
  }

  const handleJoinCommunity = async (commId: string) => {
    try {
      // 1. Join community
      const { error: joinErr } = await supabase
        .from('community_members')
        .insert({
          community_id: commId,
          user_id: currentUser.id,
          role: 'member',
        })

      if (joinErr) throw joinErr

      // 2. Join all associated sub-group channels (chats)
      const { data: communityChats } = await supabase
        .from('chats')
        .select('id')
        .eq('community_id', commId)

      if (communityChats) {
        for (const chat of communityChats) {
          await supabase
            .from('chat_members')
            .insert({
              chat_id: chat.id,
              user_id: currentUser.id,
              role: 'member',
            })
            .maybeSingle()
        }
      }

      setJoinedCommunities([...joinedCommunities, commId])
      toast.success('Successfully joined community!')
      await loadCommunityMembers(commId)
    } catch (err: any) {
      toast.error(err.message || 'Failed to join community')
    }
  }

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) {
      toast.error('Community name is required')
      return
    }
    if (!/^[a-z0-9-]{3,40}$/.test(createSlug)) {
      toast.error('Slug must be 3-40 lowercase characters, numbers, or dashes')
      return
    }

    setCreating(true)
    try {
      const { data: comm, error } = await supabase
        .from('communities')
        .insert({
          slug: createSlug,
          name: createName.trim(),
          description: createDesc.trim() || null,
          owner_id: currentUser.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('Slug already exists. Please choose a unique slug.')
        } else {
          throw error
        }
        return
      }

      // Join creator
      await supabase
        .from('community_members')
        .insert({
          community_id: comm.id,
          user_id: currentUser.id,
          role: 'owner',
        })

      // Create default general chat channel
      const { data: chat } = await supabase
        .from('chats')
        .insert({
          type: 'group',
          name: 'general',
          description: 'General discussion',
          created_by: currentUser.id,
          is_public: true,
          community_id: comm.id,
        })
        .select()
        .single()

      if (chat) {
        await supabase
          .from('chat_members')
          .insert({
            chat_id: chat.id,
            user_id: currentUser.id,
            role: 'owner',
          })
      }

      toast.success(`Community "${createName}" created!`)
      setShowCreateModal(false)
      setCreateName('')
      setCreateDesc('')
      await loadCommunities(currentUser.id)
      setActiveCommunityId(comm.id)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create community')
    } finally {
      setCreating(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessageText.trim() || !activeChannelId) return

    // Word filter validation
    const words = bannedWords.split(',').map((w) => w.trim().toLowerCase()).filter(Boolean)
    const containsBanned = words.some((word) => newMessageText.toLowerCase().includes(word))
    if (containsBanned) {
      toast.error('Message rejected: contains flagged words.')
      return
    }

    // Check if announcements-only and not owner/admin
    const activeChanObj = channels.find((c) => c.id === activeChannelId)
    const activeCommObj = communities.find((c) => c.id === activeCommunityId)
    const myRoleObj = members.find((m) => m.user_id === currentUser.id)
    const isPrivileged = myRoleObj && ['owner', 'admin', 'moderator'].includes(myRoleObj.role)

    if (activeChanObj?.announcement_only && !isPrivileged) {
      toast.error('Only administrators can send messages to this broadcast channel.')
      return
    }

    setSendingMessage(true)
    try {
      const { error } = await supabase.from('messages').insert({
        chat_id: activeChannelId,
        sender_id: currentUser.id,
        body: newMessageText.trim(),
        type: 'text',
      })

      if (error) throw error
      setNewMessageText('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const activeCommunity = communities.find((c) => c.id === activeCommunityId)
  const activeChannel = channels.find((c) => c.id === activeChannelId)
  const isJoined = joinedCommunities.includes(activeCommunityId)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground md:flex-row overflow-hidden">
      {/* Sidebar: Communities list and Channels */}
      <div className="w-full md:w-64 border-r border-border bg-card/10 flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Communities
              </span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowCreateModal(true)}>
              <PlusCircle className="h-4 w-4 text-brand-blue-500" />
            </Button>
          </div>

          <select
            value={activeCommunityId}
            onChange={(e) => setActiveCommunityId(e.target.value)}
            className="w-full mt-3 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-groups Channels */}
        <div className="flex-1 p-2 flex flex-col justify-between overflow-y-auto scrollbar-thin">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground px-2 mb-1 block">
              Channels
            </span>
            {channels.map((ch) => {
              const isActive = ch.id === activeChannelId
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-gradient text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                  {ch.announcement_only && (
                    <Badge variant="outline" className="ml-auto text-[8px] bg-white/20 text-white border-none py-0 px-1">
                      Broadcast
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>

          {activeCommunity && !isJoined && (
            <div className="p-3 border border-border bg-card/60 rounded-xl mt-4 space-y-2 shrink-0">
              <p className="text-[10px] text-muted-foreground leading-normal">
                You are previewing this community. Join to chat in channels.
              </p>
              <Button size="xs" variant="gradient" className="w-full text-xs" onClick={() => handleJoinCommunity(activeCommunity.id)}>
                Join Community
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Center Column: Community Chat window */}
      <div className="flex-1 flex flex-col border-r border-border bg-card/5 overflow-hidden">
        {/* Channel Header */}
        <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-brand-blue-500" />
              {activeChannel?.name || 'select-channel'}
            </h2>
            <p className="text-[10px] text-muted-foreground truncate max-w-sm">
              {activeChannel?.description || 'No description provided.'}
            </p>
          </div>
          {activeCommunity?.is_verified && (
            <Badge variant="outline" className="text-[9px] bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20 py-0.5">
              Verified Hub
            </Badge>
          )}
        </div>

        {/* Message history */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground space-y-2 mt-8">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p>No messages here yet. Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id
              return (
                <div key={msg.id} className="flex items-start gap-3 text-xs max-w-2xl">
                  <div className="h-8 w-8 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold shrink-0">
                    {msg.sender?.avatar_url ? (
                      <img src={msg.sender.avatar_url} alt="Avatar" className="h-full w-full object-cover rounded-full" />
                    ) : (
                      msg.sender?.display_name[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{msg.sender?.display_name || 'Contributor'}</span>
                      <span className="text-[9px] text-muted-foreground">@{msg.sender?.username || 'user'}</span>
                      <span className="text-[9px] text-muted-foreground/60">•</span>
                      <span className="text-[9px] text-muted-foreground/60">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[13px] whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Message Input composer */}
        <div className="p-4 border-t border-border bg-card/20 shrink-0">
          {isJoined ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={
                  activeChannel?.announcement_only
                    ? 'Only administrators can broadcast here...'
                    : `Message #${activeChannel?.name || 'channel'}...`
                }
                disabled={activeChannel?.announcement_only && !['owner', 'admin'].includes(members.find((m) => m.user_id === currentUser.id)?.role || '')}
                className="bg-card text-xs flex-1"
              />
              <Button
                type="submit"
                size="icon"
                variant="gradient"
                disabled={sendingMessage || (activeChannel?.announcement_only && !['owner', 'admin'].includes(members.find((m) => m.user_id === currentUser.id)?.role || ''))}
                className="shrink-0 h-9 w-9"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center p-2 text-xs text-muted-foreground">
              You must join this community to send messages.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Community Info & Moderation Settings */}
      <div className="w-full md:w-72 p-6 bg-card shrink-0 space-y-6 overflow-y-auto scrollbar-thin">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-4">
            <Shield className="h-4 w-4 text-brand-blue-500" />
            Community Admin Controls
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Slow Mode</p>
                <p className="text-[10px] text-muted-foreground">Limit message rate to 15s</p>
              </div>
              <Switch checked={slowMode} onCheckedChange={setSlowMode} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Broadcast Channel Mode</p>
                <p className="text-[10px] text-muted-foreground">Restrict posts to admins only</p>
              </div>
              <Switch checked={announcementMode} onCheckedChange={setAnnouncementMode} disabled />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="wordsFilter" className="text-xs">Banned Words Filter</Label>
              <Input
                id="wordsFilter"
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                placeholder="crypto, spam, coupon"
                className="bg-background h-8 text-xs"
              />
              <Button size="xs" variant="outline" className="w-full mt-1.5" onClick={() => toast.success('Filter rule updated')}>
                Save Filter Rule
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Member list directory */}
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3">
            <Users className="h-4 w-4 text-brand-green-500" />
            Members ({members.length})
          </h3>
          <ScrollArea className="h-64 pr-2">
            <div className="space-y-3">
              {members.map((m) => {
                const roleColors = {
                  owner: 'bg-red-500/10 text-red-500 border-red-500/20',
                  admin: 'bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20',
                  moderator: 'bg-brand-green-500/10 text-brand-green-500 border-brand-green-500/20',
                  member: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
                }
                return (
                  <div key={m.user_id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold shrink-0 text-[10px]">
                        {m.profile?.avatar_url ? (
                          <img src={m.profile.avatar_url} alt="Avatar" className="h-full w-full object-cover rounded-full" />
                        ) : (
                          m.profile?.display_name[0]?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{m.profile?.display_name || 'Contributor'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">@{m.profile?.username || 'user'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[8px] px-1 capitalize py-0 shrink-0 ${roleColors[m.role as keyof typeof roleColors]}`}>
                      {m.role}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Users className="h-5 w-5 text-brand-blue-500" />
                Create Super Community
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="commName">Community Name</Label>
                <Input
                  id="commName"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Developer Hub"
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commSlug">Community Slug</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                  <Input
                    id="commSlug"
                    value={createSlug}
                    onChange={(e) => setCreateSlug(e.target.value)}
                    placeholder="developer-hub"
                    className="pl-7 bg-background text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commDesc">Description</Label>
                <textarea
                  id="commDesc"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Describe your community..."
                  className="w-full min-h-[50px] rounded-lg border border-border bg-background p-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                  rows={2}
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full mt-2" disabled={creating}>
                {creating && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Create Hub
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
