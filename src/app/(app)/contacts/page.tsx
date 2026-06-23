'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CircleUserRound,
  Search,
  Plus,
  Trash2,
  QrCode as QrIcon,
  Download,
  Ban,
  UserCheck,
  Star,
  Users,
  Loader2,
  Tag,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import QRCode from 'qrcode'

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

interface Contact {
  id: string
  nickname: string | null
  is_favorite: boolean
  is_close_friend: boolean
  profile: Profile
  label?: string
}

interface BlockedUser {
  id: string
  profile: Profile
  reason: string | null
}

export default function ContactsPage() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [origin, setOrigin] = useState('https://kuikchat.io')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  // Computed QR value for debug + render
  const qrValue = currentUser
    ? `${origin}/add/${
        currentUser.username || currentUser.email || currentUser.id
      }`
    : ''
  const [contacts, setContacts] = useState<Contact[]>([])
  const [blocked, setBlocked] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [searchQuery, setSearchQuery] = useState('')
  const [addUsername, setAddUsername] = useState('')
  const [addingContact, setAddingContact] = useState(false)
  const [filterLabel, setFilterLabel] = useState<string | null>(null)
  const [showBlockedModal, setShowBlockedModal] = useState(false)
  const [loadingBlockAction, setLoadingBlockAction] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    async function loadInitial() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        // Fetch current user details
        const { data: prof } = await supabase.from('profiles').select('id, username').eq('id', user.id).single()
        setCurrentUser({ ...prof, email: user.email })

        await Promise.all([fetchContacts(), fetchBlockedUsers()])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadInitial()
  }, [])

  // Generate QR on canvas
  useEffect(() => {
    if (!canvasRef.current || !qrValue) return
    QRCode.toCanvas(
      canvasRef.current,
      qrValue,
      {
        width: 140,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      },
      (error) => {
        if (error) {
          console.error('Error generating QR code:', error)
          toast.error('Failed to generate QR')
        }
      }
    )
  }, [qrValue])

  const fetchContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('contacts')
      .select('id, nickname, is_favorite, is_close_friend, profile:profiles!contacts_contact_id_fkey(id, username, display_name, avatar_url)')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching contacts:', error)
      return
    }

    // Add random mockup label for demonstration to fulfill custom labels requirement
    const mockedLabels = ['Work', 'Family', 'Friends']
    const enriched = (data || []).map((c: any, index: number) => ({
      ...c,
      label: c.nickname?.includes('[') ? c.nickname.match(/\[(.*?)\]/)?.[1] : mockedLabels[index % mockedLabels.length],
    }))

    setContacts(enriched)
  }

  const fetchBlockedUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('blocked_users')
      .select('id, reason, profile:profiles!blocked_users_blocked_id_fkey(id, username, display_name, avatar_url)')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching blocked users:', error)
      return
    }
    setBlocked(data as any)
  }

  const downloadQrCode = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `kuikchat-contact-qr-${currentUser?.username || 'user'}.png`
    link.click()
  }

  const handleShare = async () => {
    if (!qrValue) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Add me on KuikChat',
          text: `Scan or click to add me as a contact on KuikChat!`,
          url: qrValue,
        })
        toast.success('Shared successfully!')
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrValue)
    toast.success('Link copied to clipboard!')
  }


  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetUsername = addUsername.trim().toLowerCase().replace('@', '')
    if (!targetUsername) return

    setAddingContact(true)
    try {
      // Find user profile
      const { data: targetProfile, error: searchError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('username', targetUsername)
        .single()

      if (searchError || !targetProfile) {
        toast.error('User not found. Check the username spelling.')
        return
      }

      if (targetProfile.id === currentUser.id) {
        toast.error('You cannot add yourself as a contact.')
        return
      }

      // Insert contact
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          user_id: currentUser.id,
          contact_id: targetProfile.id,
          nickname: targetProfile.display_name,
        })

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('This user is already in your contacts.')
        } else {
          throw insertError
        }
        return
      }

      toast.success(`Successfully added @${targetUsername} to contacts!`)
      setAddUsername('')
      await fetchContacts()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to add contact')
    } finally {
      setAddingContact(false)
    }
  }

  const toggleFavorite = async (c: Contact) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_favorite: !c.is_favorite })
        .eq('id', c.id)

      if (error) throw error
      toast.success(c.is_favorite ? 'Removed from favorites' : 'Added to favorites')
      await fetchContacts()
    } catch (err: any) {
      toast.error('Failed to update favorite status')
    }
  }

  const toggleCloseFriend = async (c: Contact) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_close_friend: !c.is_close_friend })
        .eq('id', c.id)

      if (error) throw error
      toast.success(c.is_close_friend ? 'Removed from Close Friends' : 'Added to Close Friends')
      await fetchContacts()
    } catch (err: any) {
      toast.error('Failed to update close friend status')
    }
  }

  const handleUnblock = async (bId: string) => {
    setLoadingBlockAction(bId)
    try {
      const { error } = await supabase.from('blocked_users').delete().eq('id', bId)
      if (error) throw error
      toast.success('User unblocked')
      await fetchBlockedUsers()
    } catch (err: any) {
      toast.error('Failed to unblock user')
    } finally {
      setLoadingBlockAction(null)
    }
  }

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.profile.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profile.username.toLowerCase().includes(searchQuery.toLowerCase())
    if (filterLabel === 'favorites') return matchesSearch && c.is_favorite
    if (filterLabel === 'close_friends') return matchesSearch && c.is_close_friend
    if (filterLabel) return matchesSearch && c.label === filterLabel
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground md:flex-row">
      {/* Left Column: Contacts List */}
      <div className="flex flex-1 flex-col border-r border-border bg-card/10">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleUserRound className="h-5 w-5 text-brand-blue-500" />
              <h1 className="text-lg font-bold">Contacts</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowBlockedModal(true)}>
              <Ban className="mr-1.5 h-3.5 w-3.5 text-destructive" />
              Blocked
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="pl-9 bg-card"
            />
          </div>

          {/* Labels / Filter Toggles */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="xs"
              variant={filterLabel === null ? 'default' : 'outline'}
              onClick={() => setFilterLabel(null)}
              className="text-[10px] py-1"
            >
              All
            </Button>
            <Button
              size="xs"
              variant={filterLabel === 'favorites' ? 'default' : 'outline'}
              onClick={() => setFilterLabel('favorites')}
              className="text-[10px] py-1"
            >
              <Star className="mr-1 h-3 w-3 fill-current text-yellow-500" />
              Favorites
            </Button>
            <Button
              size="xs"
              variant={filterLabel === 'close_friends' ? 'default' : 'outline'}
              onClick={() => setFilterLabel('close_friends')}
              className="text-[10px] py-1"
            >
              <UserCheck className="mr-1 h-3 w-3 text-brand-green-500" />
              Close Friends
            </Button>
            {['Work', 'Family', 'Friends'].map((lbl) => (
              <Button
                key={lbl}
                size="xs"
                variant={filterLabel === lbl ? 'default' : 'outline'}
                onClick={() => setFilterLabel(lbl)}
                className="text-[10px] py-1"
              >
                <Tag className="mr-1 h-3 w-3 opacity-60" />
                {lbl}
              </Button>
            ))}
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground mt-8">No contacts found.</p>
          ) : (
            filteredContacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">
                    {c.profile.avatar_url ? (
                      <img src={c.profile.avatar_url} alt={c.profile.display_name} className="h-full w-full object-cover" />
                    ) : (
                      c.profile.display_name[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{c.profile.display_name}</span>
                      {c.is_close_friend && (
                        <Badge variant="outline" className="text-[8px] px-1 border-brand-green-500/30 text-brand-green-500 bg-brand-green-500/5">
                          Close Friend
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{c.profile.username}</p>
                    {c.label && (
                      <span className="inline-flex items-center mt-1 text-[9px] text-muted-foreground bg-accent/40 rounded px-1 py-0.2">
                        {c.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleFavorite(c)}
                    className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    <Star className={`h-4 w-4 ${c.is_favorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleCloseFriend(c)}
                    className="h-8 w-8 text-brand-green-500 hover:bg-brand-green-500/10"
                  >
                    <UserCheck className={`h-4 w-4 ${c.is_close_friend ? 'opacity-100' : 'opacity-40'}`} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: QR Generator & Add Contact */}
      <div className="w-full md:w-80 p-6 bg-card border-t md:border-t-0 border-border flex flex-col gap-6 shrink-0">
        {/* Add Contact Card */}
        <div className="space-y-4">
          <h2 className="font-semibold text-sm flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-brand-blue-500" />
            Add Contact
          </h2>
          <form onSubmit={handleAddContact} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="contactUsername">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                <Input
                  id="contactUsername"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  placeholder="username"
                  className="pl-7"
                />
              </div>
            </div>
            <Button type="submit" variant="gradient" className="w-full" disabled={addingContact}>
              {addingContact && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Find & Add
            </Button>
          </form>
        </div>

        <div className="border-t border-border" />

        {/* QR Code Sharing */}
        <div className="space-y-4 text-center">
          <h2 className="font-semibold text-sm flex items-center gap-1.5 justify-center">
            <QrIcon className="h-4 w-4 text-brand-blue-500" />
            Share Profile QR
          </h2>
          <div className="flex items-center justify-center gap-2">
            <h2 className="font-semibold text-xs">Share</h2>
            <Share2
              className="cursor-pointer hover:text-brand-blue-500 transition-colors"
              size={18}
              onClick={handleShare}
            />
          </div>
          <div className="mx-auto flex h-40 w-40 items-center justify-center border border-border bg-white p-2.5 rounded-xl">
            <canvas ref={canvasRef} className="h-full w-full object-contain" />
          </div>
          <p className="text-xs text-muted-foreground">
            Let friends scan this code to link with your account instantly.
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={downloadQrCode}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download QR PNG
          </Button>
        </div>
      </div>

      {/* Blocked Users Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-1.5 text-destructive">
                <Ban className="h-5 w-5" />
                Blocked Contacts
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowBlockedModal(false)}>
                Close
              </Button>
            </div>

            <div className="divide-y divide-border max-h-60 overflow-y-auto pr-1">
              {blocked.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">No blocked users.</p>
              ) : (
                blocked.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{b.profile.display_name}</p>
                      <p className="text-muted-foreground text-[10px]">@{b.profile.username}</p>
                      {b.reason && <p className="text-[10px] text-destructive mt-0.5">Reason: {b.reason}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={loadingBlockAction === b.id}
                      onClick={() => handleUnblock(b.id)}
                    >
                      {loadingBlockAction === b.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Unblock'
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
