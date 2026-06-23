'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserPlus, 
  MessageSquare, 
  ArrowLeft, 
  Loader2, 
  UserCheck, 
  AlertCircle, 
  Compass,
  Sparkles,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
}

export default function AddContactPage({ params }: { params: { username: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const targetParam = decodeURIComponent(params.username).trim()

  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isSelf, setIsSelf] = useState(false)
  const [isContact, setIsContact] = useState(false)
  const [adding, setAdding] = useState(false)
  const [chatting, setChatting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // 1. Get current logged-in user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setMe(user.id)

        // 2. Fetch the target profile
        // Check if dynamic parameter is a valid UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetParam)
        
        let query = supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, bio')
          
        if (isUuid) {
          query = query.eq('id', targetParam)
        } else {
          query = query.eq('username', targetParam.toLowerCase())
        }

        const { data: targetProfile, error: profileErr } = await query.maybeSingle()

        if (profileErr) {
          throw new Error(profileErr.message)
        }

        if (!targetProfile) {
          setError('Profile not found. Make sure the link or QR code is correct.')
          setLoading(false)
          return
        }

        const targetUser = targetProfile as Profile
        setProfile(targetUser)

        // 3. Fetch current user's profile to compare username/id safely
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', user.id)
          .maybeSingle()

        // Determine if self-addition
        const isSelfUser = 
          targetUser.id.toLowerCase() === user.id.toLowerCase() ||
          (myProfile && targetUser.id.toLowerCase() === myProfile.id.toLowerCase()) ||
          (myProfile && targetUser.username.toLowerCase() === myProfile.username.toLowerCase())

        if (isSelfUser) {
          setIsSelf(true)
          setLoading(false)
          return
        }

        // 4. Check if already contact
        const { data: contactData, error: contactErr } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', user.id)
          .eq('contact_id', targetUser.id)
          .maybeSingle()

        if (contactErr) {
          console.error('Error checking contact status:', contactErr)
        }

        if (contactData) {
          setIsContact(true)
        }
      } catch (err: any) {
        console.error('Failed to load profile details:', err)
        setError(err.message || 'An unexpected error occurred.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [targetParam])

  // Handle add contact operation
  const handleAddContact = async () => {
    if (!me || !profile) return
    setAdding(true)
    try {
      const { error: insertErr } = await supabase
        .from('contacts')
        .insert({
          user_id: me,
          contact_id: profile.id,
          nickname: profile.display_name || profile.username,
        })

      if (insertErr) {
        if (insertErr.code === '23505') {
          setIsContact(true)
          toast.info('This user is already in your contacts.')
        } else {
          throw insertErr
        }
      } else {
        setIsContact(true)
        toast.success(`Successfully added @${profile.username} to contacts!`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to add contact')
    } finally {
      setAdding(false)
    }
  }

  // Handle direct messaging redirect
  const handleStartChat = async () => {
    if (!profile) return
    setChatting(true)
    try {
      const { data: chatId, error: chatErr } = await supabase.rpc('upsert_direct_chat', {
        p_other: profile.id,
      })

      if (chatErr) throw chatErr

      if (chatId) {
        router.push(`/chats/${chatId}`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to open conversation')
      setChatting(false)
    }
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient opacity-[0.03] pointer-events-none" />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-brand-blue-500" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">
            Fetching profile details...
          </p>
        </div>
      </div>
    )
  }

  // Error Screen / Not Found
  if (error || !profile) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient opacity-[0.03] pointer-events-none" />
        <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 h-24 w-24 bg-destructive/10 rounded-full blur-xl group-hover:bg-destructive/20 transition-all duration-700" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20 shadow-inner">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Profile Not Found</CardTitle>
            <CardDescription className="mt-1.5 text-sm text-muted-foreground">
              {error || 'The profile details could not be loaded.'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2 pt-4">
            <Button className="w-full" variant="gradient" onClick={() => router.push('/contacts')}>
              <Compass className="mr-2 h-4 w-4" />
              Go to Contacts
            </Button>
            <Button className="w-full text-muted-foreground hover:text-foreground" variant="ghost" onClick={() => router.push('/chats')}>
              Back to Chats
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const name = profile.display_name || profile.username || 'User'

  // Render main screen
  return (
    <div className="flex h-full w-full items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-brand-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-brand-green-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute inset-0 bg-brand-gradient opacity-[0.02] pointer-events-none" />

      <Card className="w-full max-w-md border border-border/80 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-brand-blue-500/5 hover:border-border">
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-brand-gradient" />

        {/* User Card Content */}
        <CardHeader className="text-center pt-8 pb-4">
          <div className="relative mx-auto mb-4 w-24 h-24 rounded-full p-1 bg-brand-gradient shadow-xl">
            <div className="h-full w-full rounded-full overflow-hidden border-2 border-card bg-card flex items-center justify-center text-xl font-bold">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-foreground">{getInitials(name)}</span>
              )}
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
            {name}
            {isContact && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold py-0.5 px-2 bg-brand-green-500/10 border border-brand-green-500/20 text-brand-green-500 rounded-full">
                <UserCheck className="h-3 w-3" />
                Contact
              </span>
            )}
          </CardTitle>
          
          <CardDescription className="text-sm font-medium text-brand-blue-500">
            @{profile.username}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center px-6 pb-6 border-b border-border/50">
          <div className="rounded-lg bg-card/60 border border-border/40 p-4 min-h-[4rem] flex flex-col justify-center">
            {profile.bio ? (
              <p className="text-sm text-muted-foreground italic break-words">
                "{profile.bio}"
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">
                No bio provided by this user.
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 p-6 bg-card/25">
          {isSelf ? (
            <div className="w-full text-center space-y-3">
              <div className="mx-auto inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue-500/10 border border-brand-blue-500/20 text-brand-blue-500 rounded-full text-xs font-medium">
                <QrCode className="h-3.5 w-3.5" />
                Your Profile QR Code
              </div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                This is your own QR code. Let friends scan it to add you as a contact instantly.
              </p>
              <Button className="w-full mt-2" variant="gradient" onClick={() => router.push('/contacts')}>
                <Compass className="mr-2 h-4 w-4" />
                Go to Contacts
              </Button>
            </div>
          ) : isContact ? (
            <div className="w-full space-y-3">
              <p className="text-center text-xs text-muted-foreground">
                You and {profile.display_name || `@${profile.username}`} are already connected!
              </p>
              <div className="flex gap-2 w-full">
                <Button className="flex-1" variant="gradient" onClick={handleStartChat} disabled={chatting}>
                  {chatting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="mr-2 h-4 w-4" />
                  )}
                  Open Chat
                </Button>
                <Button className="px-4" variant="outline" onClick={() => router.push('/contacts')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div className="flex gap-2 w-full">
                <Button className="flex-1" variant="gradient" onClick={handleAddContact} disabled={adding}>
                  {adding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Add Contact
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => router.push('/contacts')}>
                  Cancel
                </Button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3 text-brand-blue-500" />
                Scan instant invite powered by KuikChat Link
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
