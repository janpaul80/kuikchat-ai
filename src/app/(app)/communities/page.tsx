'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, PlusCircle, Megaphone, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  logo_url?: string | null
}

interface CommunityChat {
  id: string
  name: string
  description: string | null
  type: 'direct' | 'group' | 'hermes' | 'self'
  announcement_only: boolean
  slow_mode_seconds: number
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
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [communities, setCommunities] = useState<Community[]>([])
  const [activeCommunityId, setActiveCommunityId] = useState<string>('')
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([])

  const [channels, setChannels] = useState<CommunityChat[]>([])
  const [announcementChat, setAnnouncementChat] = useState<CommunityChat | null>(null)
  const [members, setMembers] = useState<Member[]>([])

  // Create flow state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createDesc, setCreateDesc] = useState(
    'Hi everyone! This community is for members to chat in topic-based groups and get important announcements.'
  )
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)

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

  useEffect(() => {
    const slugified = createName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setCreateSlug(slugified)
  }, [createName])

  useEffect(() => {
    if (!activeCommunityId) return
    loadCommunityChannels(activeCommunityId)
    loadCommunityMembers(activeCommunityId)
  }, [activeCommunityId])

  const loadCommunities = async (userId: string) => {
    const { data: comms, error } = await supabase
      .from('communities')
      .select('*')
      .order('name', { ascending: true })
    if (error) {
      console.error('Error fetching communities:', error)
      return
    }
    setCommunities(comms || [])

    const { data: joined } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', userId)
    const joinedIds = (joined || []).map((j) => j.community_id)
    setJoinedCommunities(joinedIds)

    if (comms && comms.length > 0) {
      const found = comms.find((c) => c.id === activeCommunityId)
      if (!found) setActiveCommunityId(comms[0].id)
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

    const all = data || []
    const ann = all.find((c) => c.announcement_only) || null
    const groups = all.filter((c) => !c.announcement_only).sort((a, b) => a.name.localeCompare(b.name))
    setAnnouncementChat(ann || null)
    setChannels(groups)
  }

  const loadCommunityMembers = async (communityId: string) => {
    const { data, error } = await supabase
      .from('community_members')
      .select('user_id, role, profile:profiles(display_name, username, avatar_url)')
      .eq('community_id', communityId)

    if (error) {
      console.error('Error loading community members:', error)
      return
    }
    setMembers((data as any) || [])
  }

  const handleJoinCommunity = async (commId: string) => {
    try {
      const { error: joinErr } = await supabase
        .from('community_members')
        .insert({ community_id: commId, user_id: currentUser.id, role: 'member' })
      if (joinErr) throw joinErr

      const { data: communityChats } = await supabase
        .from('chats')
        .select('id')
        .eq('community_id', commId)
      if (communityChats) {
        for (const chat of communityChats) {
          await supabase.from('chat_members').insert({ chat_id: chat.id, user_id: currentUser.id, role: 'member' }).maybeSingle()
        }
      }
      setJoinedCommunities([...joinedCommunities, commId])
      toast.success('Joined community')
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
          is_public: true,
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

      await supabase.from('community_members').insert({ community_id: comm.id, user_id: currentUser.id, role: 'owner' })

      const { data: generalChat } = await supabase
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
      if (generalChat) {
        await supabase.from('chat_members').insert({ chat_id: generalChat.id, user_id: currentUser.id, role: 'owner' })
      }

      const { data: annChat } = await supabase
        .from('chats')
        .insert({
          type: 'group',
          name: 'announcements',
          description: 'Official updates from the owner',
          created_by: currentUser.id,
          is_public: true,
          community_id: comm.id,
          announcement_only: true,
        })
        .select()
        .single()
      if (annChat) {
        await supabase.from('chat_members').insert({ chat_id: annChat.id, user_id: currentUser.id, role: 'owner' })
      }

      if (createLogoFile) {
        try {
          const path = `communities/${comm.id}/${createLogoFile.name}`
          const { error: upErr } = await supabase.storage.from('avatars').upload(path, createLogoFile, { upsert: true, cacheControl: '3600' })
          if (!upErr) {
            const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
            if (pub?.publicUrl) await supabase.from('communities').update({ logo_url: pub.publicUrl }).eq('id', comm.id)
          }
        } catch (e) {
          console.warn('Logo upload failed, continuing without logo')
        }
      }

      toast.success(`Community "${createName}" created`)
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

  const openGroupChat = (chatId: string) => {
    router.push(`/chats/${chatId}`)
  }

  const activeCommunity = communities.find((c) => c.id === activeCommunityId)
  const isJoined = joinedCommunities.includes(activeCommunityId)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Communities</span>
        </div>
        <Button size="sm" variant="gradient" onClick={() => setShowCreateModal(true)} data-testid="open-create-community">
          New community
        </Button>
      </div>

      {!activeCommunityId ? (
        <div className="flex-1 grid place-items-center">
          {communities.length === 0 ? (
            <div className="text-center max-w-md mx-auto p-6">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-brand-gradient/20 grid place-items-center">
                <ImageIcon className="h-10 w-10 text-brand-blue-500" />
              </div>
              <h2 className="text-lg font-semibold">Stay connected with a community</h2>
              <p className="text-sm text-muted-foreground mt-1">Communities bring members together in topic-based groups. Any community you're added to will appear here.</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button variant="gradient" onClick={() => setShowCreateModal(true)}>New community</Button>
                {communities.length > 0 && (
                  <Button variant="outline" onClick={() => setActiveCommunityId(communities[0].id)}>See example communities</Button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.map((c) => (
                <button key={c.id} onClick={() => setActiveCommunityId(c.id)} className="text-left border border-border rounded-xl p-4 bg-card hover:bg-card/70 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-gradient text-white grid place-items-center font-bold">
                      {c.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.member_count || 0} members</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Community header */}
          <div className="px-6 py-5 border-b border-border bg-card/50 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand-gradient text-white grid place-items-center font-bold">
              {activeCommunity?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div>
              <div className="text-sm font-semibold">{activeCommunity?.name}</div>
              <div className="text-[11px] text-muted-foreground">{activeCommunity?.description || 'Topic-based groups and announcements'}</div>
            </div>
          </div>

          {/* Announcements pinned */}
          {announcementChat && (
            <div className="px-6 pt-5">
              <div className="border border-border rounded-xl p-4 bg-card/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-gradient text-white grid place-items-center">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Announcements</div>
                    <div className="text-[11px] text-muted-foreground">Admin-only updates for everyone in the community</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => openGroupChat(announcementChat.id)}>Open</Button>
              </div>
            </div>
          )}

          {/* Groups you are in */}
          <div className="px-6 mt-6">
            <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wide mb-2">Groups you're in</div>
            <div className="space-y-2">
              {channels.map((g) => (
                <button key={g.id} onClick={() => openGroupChat(g.id)} className="w-full text-left border border-border rounded-xl p-3 bg-card hover:bg-card/70">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-gradient text-white grid place-items-center font-bold">{g.name?.[0]?.toUpperCase() || 'G'}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{g.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{g.description || 'Group chat'}</div>
                    </div>
                    <Badge variant="outline" className="ml-auto text-[9px]">Joined</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Groups you can join - show placeholder since join is managed via community membership for now */}
          <div className="px-6 mt-6">
            <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wide mb-2">Groups you can join</div>
            <div className="text-[11px] text-muted-foreground">Ask an admin to invite you to more groups. Public join links will be added here later.</div>
          </div>

          {/* Add group */}
          <div className="px-6 py-6">
            <Button variant="outline" onClick={async () => {
              try {
                const { data: chat } = await supabase
                  .from('chats')
                  .insert({ type: 'group', name: 'new-group', description: 'New group', created_by: currentUser.id, is_public: true, community_id: activeCommunityId })
                  .select()
                  .single()
                if (chat) {
                  await supabase.from('chat_members').insert({ chat_id: chat.id, user_id: currentUser.id, role: 'owner' })
                  toast.success('Group created')
                  await loadCommunityChannels(activeCommunityId)
                }
              } catch (e: any) {
                toast.error(e.message || 'Failed to create group')
              }
            }}>+ Add group</Button>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Users className="h-5 w-5 text-brand-blue-500" />
                New community
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="commLogo">Logo</Label>
                <input id="commLogo" type="file" accept="image/*" onChange={(e) => setCreateLogoFile(e.target.files?.[0] || null)} className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commName">Community Name</Label>
                <Input id="commName" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Developer Hub" className="bg-background text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commSlug">Community Slug</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                  <Input id="commSlug" value={createSlug} onChange={(e) => setCreateSlug(e.target.value)} placeholder="developer-hub" className="pl-7 bg-background text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commDesc">Description</Label>
                <textarea id="commDesc" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} placeholder="Describe your community..." className="w-full min-h-[50px] rounded-lg border border-border bg-background p-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-blue-500" rows={2} />
              </div>

              <Button type="submit" variant="gradient" className="w-full mt-2" disabled={creating}>
                {creating && <span className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />}
                Create
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
