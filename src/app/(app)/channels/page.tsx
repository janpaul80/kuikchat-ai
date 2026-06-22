'use client'

import { useEffect, useState } from 'react'
import {
  Megaphone,
  Plus,
  Search,
  Lock,
  Unlock,
  Send,
  Heart,
  MessageSquare,
  Eye,
  Loader2,
  Share2,
  CheckCircle,
  Bell,
  BellOff,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Channel {
  id: string
  slug: string
  name: string
  description: string | null
  category: string | null
  owner_id: string
  is_public: boolean
  is_verified: boolean
  subscriber_count: number
  post_count: number
  created_at: string
}

interface ChannelPost {
  id: string
  channel_id: string
  author_id: string | null
  title: string | null
  body: string | null
  is_premium: boolean
  published_at: string | null
  created_at: string
  channel: {
    name: string
    is_verified: boolean
  }
}

export default function ChannelsPage() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [subscribedIds, setSubscribedIds] = useState<string[]>([])
  const [posts, setPosts] = useState<ChannelPost[]>([])
  const [loading, setLoading] = useState(true)

  // Filter tabs: 'discover' | 'subscribed' | 'my-channels'
  const [activeTab, setActiveTab] = useState<'discover' | 'subscribed' | 'my-channels'>('discover')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Channel Form State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createIsPublic, setCreateIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)

  // Broadcast Composer State
  const [selectedChannelId, setSelectedChannelId] = useState<string>('')
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')
  const [broadcastIsPremium, setBroadcastIsPremium] = useState(false)
  const [broadcasting, setBroadcasting] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setCurrentUser(user)

        await Promise.all([
          fetchChannels(user.id),
          fetchSubscriptions(user.id),
          fetchFeed(user.id),
        ])
      } catch (err) {
        console.error('Error initializing channels page:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Auto-fill slug from name during creation
  useEffect(() => {
    const slugified = createName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setCreateSlug(slugified)
  }, [createName])

  const fetchChannels = async (userId: string) => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('subscriber_count', { ascending: false })

    if (error) {
      console.error('Error fetching channels:', error)
      return
    }
    setChannels(data || [])
    if (data && data.length > 0) {
      // Find a channel owned by user to default selection in composer
      const owned = data.find((c) => c.owner_id === userId)
      if (owned) {
        setSelectedChannelId(owned.id)
      }
    }
  }

  const fetchSubscriptions = async (userId: string) => {
    const { data, error } = await supabase
      .from('channel_subscribers')
      .select('channel_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return
    }
    setSubscribedIds((data || []).map((s) => s.channel_id))
  }

  const fetchFeed = async (userId: string) => {
    // In a real app, feed fetches posts from subscribed channels or owned channels.
    // We join the channels table to get channel name and status.
    const { data, error } = await supabase
      .from('channel_posts')
      .select('*, channel:channels(name, is_verified)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching channel posts feed:', error)
      return
    }
    setPosts(data || [])
  }

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) {
      toast.error('Channel name is required')
      return
    }
    if (!/^[a-z0-9_-]{3,40}$/.test(createSlug)) {
      toast.error('Slug must be 3-40 lowercase characters, numbers, dashes, or underscores')
      return
    }

    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          slug: createSlug,
          name: createName.trim(),
          description: createDesc.trim() || null,
          owner_id: currentUser.id,
          is_public: createIsPublic,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('Channel slug already exists. Please choose a unique slug.')
        } else {
          throw error
        }
        return
      }

      toast.success(`Channel "${createName}" created successfully!`)
      setShowCreateModal(false)
      setCreateName('')
      setCreateDesc('')
      
      // Auto-subscribe owner
      await supabase
        .from('channel_subscribers')
        .insert({ channel_id: data.id, user_id: currentUser.id })

      await Promise.all([
        fetchChannels(currentUser.id),
        fetchSubscriptions(currentUser.id),
      ])
      setSelectedChannelId(data.id)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create channel')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleSubscribe = async (channel: Channel) => {
    const isSubbed = subscribedIds.includes(channel.id)

    try {
      if (isSubbed) {
        // Unsubscribe
        const { error } = await supabase
          .from('channel_subscribers')
          .delete()
          .eq('channel_id', channel.id)
          .eq('user_id', currentUser.id)

        if (error) throw error
        setSubscribedIds(subscribedIds.filter((id) => id !== channel.id))
        setChannels(
          channels.map((c) =>
            c.id === channel.id
              ? { ...c, subscriber_count: Math.max(0, c.subscriber_count - 1) }
              : c
          )
        )
        toast.success(`Unsubscribed from ${channel.name}`)
      } else {
        // Subscribe
        const { error } = await supabase
          .from('channel_subscribers')
          .insert({
            channel_id: channel.id,
            user_id: currentUser.id,
          })

        if (error) throw error
        setSubscribedIds([...subscribedIds, channel.id])
        setChannels(
          channels.map((c) =>
            c.id === channel.id ? { ...c, subscriber_count: c.subscriber_count + 1 } : c
          )
        )
        toast.success(`Subscribed to ${channel.name}!`)
      }
      await fetchFeed(currentUser.id)
    } catch (err: any) {
      toast.error(err.message || 'Subscription change failed')
    }
  }

  const handleBroadcastPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChannelId) {
      toast.error('Please select a channel to broadcast from')
      return
    }
    if (!broadcastBody.trim()) {
      toast.error('Broadcast message cannot be empty')
      return
    }

    setBroadcasting(true)
    try {
      const { error } = await supabase.from('channel_posts').insert({
        channel_id: selectedChannelId,
        author_id: currentUser.id,
        title: broadcastTitle.trim() || null,
        body: broadcastBody.trim(),
        is_premium: broadcastIsPremium,
        published_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success('Broadcast sent to all subscribers!')
      setBroadcastTitle('')
      setBroadcastBody('')
      setBroadcastIsPremium(false)
      await fetchFeed(currentUser.id)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send broadcast')
    } finally {
      setBroadcasting(false)
    }
  }

  // Filter channels based on tab & query
  const filteredChannels = channels.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === 'subscribed') {
      return matchesSearch && subscribedIds.includes(c.id) && c.owner_id !== currentUser?.id
    }
    if (activeTab === 'my-channels') {
      return matchesSearch && c.owner_id === currentUser?.id
    }
    return matchesSearch
  })

  // Filter posts to show only subscribed/owned channels in feed
  const feedPosts = posts.filter((p) => {
    // Show posts if subscribed OR if owner of channel
    const chan = channels.find((c) => c.id === p.channel_id)
    return subscribedIds.includes(p.channel_id) || (chan && chan.owner_id === currentUser?.id)
  })

  const myOwnedChannels = channels.filter((c) => c.owner_id === currentUser?.id)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground md:flex-row">
      {/* Left Column: Discover & Manage Channels */}
      <div className="flex flex-1 flex-col border-r border-border bg-card/10 overflow-hidden">
        <div className="p-4 border-b border-border space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-brand-blue-500 animate-pulse" />
              <h1 className="text-lg font-bold">Channels</h1>
            </div>
            <Button size="sm" variant="gradient" onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Channel
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels..."
              className="pl-9 bg-card"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'discover', label: 'Discover' },
              { id: 'subscribed', label: 'Following' },
              { id: 'my-channels', label: 'My Channels' },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <Button
                  key={tab.id}
                  size="xs"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="text-xs flex-1"
                >
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 mt-8 text-muted-foreground">
              <Megaphone className="h-10 w-10 opacity-30" />
              <p className="text-xs">No channels found</p>
            </div>
          ) : (
            filteredChannels.map((c) => {
              const isSubbed = subscribedIds.includes(c.id)
              const isOwner = c.owner_id === currentUser?.id

              return (
                <div
                  key={c.id}
                  className="flex items-start justify-between rounded-xl border border-border bg-card p-3.5 hover:bg-card/85 transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-sm truncate text-foreground">{c.name}</h4>
                      {c.is_verified && (
                        <CheckCircle className="h-3.5 w-3.5 fill-brand-blue-500 text-card shrink-0" />
                      )}
                      {!c.is_public && (
                        <Badge variant="outline" className="text-[9px] bg-red-500/5 text-red-500 border-red-500/20 py-0 px-1">
                          Private
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">@{c.slug}</span>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>{c.subscriber_count} subscribers</span>
                      <span>•</span>
                      <span>{c.post_count} broadcasts</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-1.5">
                    {isOwner ? (
                      <Badge variant="outline" className="text-[9px] text-brand-blue-500 border-brand-blue-500/20 bg-brand-blue-500/5 py-1">
                        Owner
                      </Badge>
                    ) : (
                      <Button
                        size="xs"
                        variant={isSubbed ? 'outline' : 'gradient'}
                        className="text-xs min-w-[76px]"
                        onClick={() => handleToggleSubscribe(c)}
                      >
                        {isSubbed ? (
                          <>
                            <UserCheck className="mr-1 h-3 w-3" />
                            Joined
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1 h-3 w-3" />
                            Join
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Middle/Right Column: Live feed & Broadcast post composer */}
      <div className="flex flex-[1.5] flex-col border-r border-border bg-card/5 overflow-hidden">
        {/* Broadcast Post Composer (only visible to channel owners) */}
        {myOwnedChannels.length > 0 && (
          <div className="p-4 border-b border-border bg-card/40 space-y-3 shrink-0">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Megaphone className="h-4 w-4 text-brand-blue-500" />
              Channel Broadcast Composer
            </h3>

            <form onSubmit={handleBroadcastPost} className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="postChannelSelect" className="text-[10px] text-muted-foreground uppercase font-bold">
                    Broadcast From
                  </Label>
                  <select
                    id="postChannelSelect"
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                  >
                    {myOwnedChannels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (@{c.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <Input
                    placeholder="Broadcast title (optional)..."
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <textarea
                placeholder="What would you like to broadcast to your subscribers? Supports multi-line formatting..."
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className="w-full min-h-[70px] rounded-lg border border-border bg-card p-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-blue-500 resize-y"
                rows={3}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Premium Only</span>
                  <Switch checked={broadcastIsPremium} onCheckedChange={setBroadcastIsPremium} />
                </div>
                <Button type="submit" size="sm" variant="gradient" disabled={broadcasting} className="text-xs">
                  {broadcasting ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Broadcast Post
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Feed Posts Header */}
        <div className="h-12 border-b border-border bg-card/25 px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Feed broadcasts ({feedPosts.length})
          </span>
        </div>

        {/* Posts Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {feedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-muted-foreground space-y-2 mt-8">
              <Megaphone className="h-10 w-10 opacity-30" />
              <p>No announcements in your feed. Follow some channels or start broadcasting!</p>
            </div>
          ) : (
            feedPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {post.is_premium && (
                  <div className="absolute top-0 right-0 bg-yellow-500/10 border-b border-l border-yellow-500/20 text-yellow-500 text-[8px] font-bold uppercase px-2 py-0.5 rounded-bl">
                    Premium
                  </div>
                )}
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-brand-blue-500">
                      {post.channel?.name || 'Unknown Channel'}
                    </span>
                    {post.channel?.is_verified && (
                      <CheckCircle className="h-3.5 w-3.5 fill-brand-blue-500 text-card" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  {post.title && <h4 className="font-bold text-sm text-foreground">{post.title}</h4>}
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {post.body}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-border/40 text-[11px] text-muted-foreground shrink-0">
                  <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className="h-3.5 w-3.5" />
                    <span>Reaction</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-brand-blue-500 transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto">
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Channel Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Megaphone className="h-5 w-5 text-brand-blue-500" />
                Create Broadcast Channel
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="chanName">Channel Name</Label>
                <Input
                  id="chanName"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Design Insights"
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chanSlug">Channel Username/Slug</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                  <Input
                    id="chanSlug"
                    value={createSlug}
                    onChange={(e) => setCreateSlug(e.target.value)}
                    placeholder="design-insights"
                    className="pl-7 bg-background text-xs"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground leading-normal">
                  Your channel link will be: kuikchat.io/channels/{createSlug || 'slug'}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chanDesc">Description</Label>
                <textarea
                  id="chanDesc"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Tell subscribers what this channel is about..."
                  className="w-full min-h-[50px] rounded-lg border border-border bg-background p-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <div>
                  <p className="font-semibold">Public Channel</p>
                  <p className="text-[10px] text-muted-foreground">Anyone can search and subscribe</p>
                </div>
                <Switch checked={createIsPublic} onCheckedChange={setCreateIsPublic} />
              </div>

              <Button type="submit" variant="gradient" className="w-full mt-2" disabled={creating}>
                {creating && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Create Channel
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
