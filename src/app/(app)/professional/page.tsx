'use client'

import { useEffect, useState } from 'react'
import {
  Briefcase,
  Plus,
  Trash2,
  Send,
  BarChart2,
  Store,
  BookOpen,
  Loader2,
  MapPin,
  Clock,
  Save,
  Video,
  Image as ImageIcon,
  DollarSign,
  PlusCircle,
  FileText,
  TrendingUp,
  Globe,
  Mail,
  Phone,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamically import Leaflet Map to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/professional/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-xl border border-border bg-card/40 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand-blue-500" />
    </div>
  ),
})

interface CatalogItem {
  id: string
  name: string
  description: string | null
  price_cents: number
  in_stock: boolean
  image_urls: string[]
  video_url?: string | null
}

interface QuickReply {
  id: string
  shortcut: string
  body: string
}

export default function ProfessionalPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('analytics')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<string>('personal')

  // Analytics Stats
  const [stats, setStats] = useState({
    sent: 0,
    received: 0,
    chats: 0,
    earnings: 0,
  })

  // Business Profile Form
  const [profileLoading, setProfileLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [category, setCategory] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [gallery, setGallery] = useState<string[]>([])
  const [addressText, setAddressText] = useState('')
  const [mapCoords, setMapCoords] = useState({ lat: 51.505, lng: -0.09 })

  // Operating Hours
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const [hours, setHours] = useState<Record<string, { active: boolean; open: string; close: string }>>(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { active: true, open: '09:00', close: '18:00' }
      return acc;
    }, {} as any)
  )

  // Catalog State
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemVideo, setNewItemVideo] = useState('')
  const [newItemImage, setNewItemImage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Quick Replies State
  const [replies, setReplies] = useState<QuickReply[]>([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [newShortcut, setNewShortcut] = useState('')
  const [newReplyText, setNewReplyText] = useState('')

  // Broadcasts State (Mock/UI wrapper)
  const [broadcasts, setBroadcasts] = useState([
    { id: '1', name: 'All Enterprise Clients', recipients: 12, lastSent: '2026-06-20' },
    { id: '2', name: 'Q3 Leads List', recipients: 45, lastSent: 'Never' },
  ])
  const [newBroadcastName, setNewBroadcastName] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user: authedUser } } = await supabase.auth.getUser()
        if (!authedUser) return
        setUser(authedUser)

        // Query the profile mode
        const { data: profile } = await supabase
          .from('profiles')
          .select('mode')
          .eq('id', authedUser.id)
          .single()
        
        if (profile) {
          setMode(profile.mode || 'personal')
        }

        await Promise.all([
          fetchAnalytics(authedUser.id),
          fetchBusinessProfile(authedUser.id),
          fetchCatalog(authedUser.id),
          fetchQuickReplies(authedUser.id),
        ])
      } catch (err) {
        console.error('Error loading professional data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Realtime subscription for profile changes (mode)
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`profile_mode_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && 'mode' in payload.new) {
            setMode(payload.new.mode || 'personal')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // ==========================================
  // 1. ANALYTICS DB QUERIES
  // ==========================================
  const fetchAnalytics = async (userId: string) => {
    try {
      // Messages Sent
      const { count: sentCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId)

      // Messages Received
      const { count: receivedCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', userId)

      // Chats Count
      const { count: chatsCount } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })

      // Paid Invoices Earnings
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_cents')
        .eq('business_id', userId)
        .eq('status', 'paid')

      const earningsSum = invoices ? invoices.reduce((acc, cur) => acc + (cur.total_cents || 0), 0) / 100 : 0

      setStats({
        sent: sentCount || 0,
        received: receivedCount || 0,
        chats: chatsCount || 0,
        earnings: earningsSum,
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
    }
  }

  // ==========================================
  // 2. BUSINESS PROFILE ACTIONS
  // ==========================================
  const fetchBusinessProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setCompanyName(data.company_name || '')
        setCategory(data.category || '')
        setWebsite(data.website || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setDescription(data.description || '')
        setLogoUrl(data.logo_url || '')
        setCoverUrl(data.cover_url || '')

        // Load hours & gallery
        if (data.hours) {
          const loadedHours = { ...data.hours }
          if (loadedHours.gallery) {
            setGallery(loadedHours.gallery || [])
            delete loadedHours.gallery
          }
          setHours(loadedHours)
        }

        // Address Parsing
        if (data.address) {
          try {
            const addrObj = JSON.parse(data.address)
            setAddressText(addrObj.addressText || '')
            setMapCoords({ lat: addrObj.lat || 51.505, lng: addrObj.lng || -0.09 })
          } catch {
            setAddressText(data.address || '')
          }
        }
      }
    } catch (err) {
      console.error('Error loading business profile:', err)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) {
      toast.error('Company Name is required')
      return
    }

    setProfileLoading(true)
    try {
      // Serialize Address
      const serializedAddress = JSON.stringify({
        addressText: addressText.trim(),
        lat: mapCoords.lat,
        lng: mapCoords.lng,
      })

      // Combine hours & gallery
      const serializedHours = {
        ...hours,
        gallery,
      }

      const payload = {
        user_id: user.id,
        company_name: companyName.trim(),
        category: category.trim(),
        website: website.trim(),
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
        logo_url: logoUrl.trim(),
        cover_url: coverUrl.trim(),
        address: serializedAddress,
        hours: serializedHours,
        updated_at: new Date().toISOString(),
      }

      // Upsert
      const { error } = await supabase
        .from('business_profiles')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Business Profile updated successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save business profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'cover' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('catalog') // using public catalog bucket
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('catalog').getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      if (field === 'logo') {
        setLogoUrl(publicUrl)
      } else if (field === 'cover') {
        setCoverUrl(publicUrl)
      } else {
        setGallery((prev) => [...prev, publicUrl])
      }
      toast.success('File uploaded successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to upload image')
    }
  }

  // ==========================================
  // 3. CATALOG ACTIONS
  // ==========================================
  const fetchCatalog = async (userId: string) => {
    setCatalogLoading(true)
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('business_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCatalog(data || [])
      // Cache to localstorage
      localStorage.setItem('kuikchat_product_catalog', JSON.stringify(data || []))
    } catch (err) {
      console.error('Error loading catalog:', err)
      // Try localstorage fallback
      const cached = localStorage.getItem('kuikchat_product_catalog')
      if (cached) {
        setCatalog(JSON.parse(cached))
      }
    } finally {
      setCatalogLoading(false)
    }
  }

  const handleCatalogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('catalog')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('catalog').getPublicUrl(filePath)
      setNewItemImage(data.publicUrl)
      toast.success('Catalog image uploaded!')
    } catch (err: any) {
      console.error(err)
      toast.error('Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddCatalog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || !newItemPrice.trim()) {
      toast.error('Name and price are required')
      return
    }

    const priceFloat = parseFloat(newItemPrice.replace(/[^\d.]/g, ''))
    if (isNaN(priceFloat)) {
      toast.error('Invalid price format')
      return
    }

    const priceCents = Math.round(priceFloat * 100)

    try {
      const payload = {
        business_id: user.id,
        name: newItemName.trim(),
        description: newItemDesc.trim(),
        price_cents: priceCents,
        in_stock: true,
        image_urls: newItemImage.trim() ? [newItemImage.trim()] : [],
        video_url: newItemVideo.trim() || null,
      }

      const { data, error } = await supabase
        .from('catalog_items')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      const updatedCatalog = [data, ...catalog]
      setCatalog(updatedCatalog)
      localStorage.setItem('kuikchat_product_catalog', JSON.stringify(updatedCatalog))

      setNewItemName('')
      setNewItemPrice('')
      setNewItemDesc('')
      setNewItemVideo('')
      setNewItemImage('')
      toast.success('Catalog item added successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to add catalog item')
    }
  }

  const handleDeleteCatalog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      const updatedCatalog = catalog.filter((x) => x.id !== id)
      setCatalog(updatedCatalog)
      localStorage.setItem('kuikchat_product_catalog', JSON.stringify(updatedCatalog))
      toast.success('Catalog item removed')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to remove catalog item')
    }
  }

  // ==========================================
  // 4. QUICK REPLIES ACTIONS
  // ==========================================
  const fetchQuickReplies = async (userId: string) => {
    setRepliesLoading(true)
    try {
      const { data, error } = await supabase
        .from('quick_replies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReplies(data || [])
    } catch (err) {
      console.error('Error loading quick replies:', err)
    } finally {
      setRepliesLoading(false)
    }
  }

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShortcut.trim() || !newReplyText.trim()) {
      toast.error('Shortcut and reply text are required')
      return
    }
    if (!newShortcut.startsWith('/')) {
      toast.error('Shortcut must start with a slash (/)')
      return
    }

    try {
      const { data, error } = await supabase
        .from('quick_replies')
        .insert({
          user_id: user.id,
          shortcut: newShortcut.trim(),
          body: newReplyText.trim(),
        })
        .select()
        .single()

      if (error) throw error

      setReplies([data, ...replies])
      setNewShortcut('')
      setNewReplyText('')
      toast.success('Quick reply template created!')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to create quick reply')
    }
  }

  const handleDeleteReply = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_replies')
        .delete()
        .eq('id', id)

      if (error) throw error
      setReplies(replies.filter((x) => x.id !== id))
      toast.success('Quick reply removed')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to delete quick reply')
    }
  }

  // ==========================================
  // 5. BROADCASTS ACTIONS
  // ==========================================
  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBroadcastName.trim()) {
      toast.error('Broadcast list name is required')
      return
    }
    setBroadcasts([
      ...broadcasts,
      {
        id: Date.now().toString(),
        name: newBroadcastName.trim(),
        recipients: Math.floor(Math.random() * 20) + 1,
        lastSent: 'Never',
      },
    ])
    setNewBroadcastName('')
    toast.success('Broadcast list created!')
  }

  const handleSendBroadcast = (name: string) => {
    toast.success(`Broadcast message dispatched to ${name}`)
  }

  // Helper: Format cent currency
  const formatCents = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  }

  // Helper: Render Video embeds
  const renderVideoEmbed = (url: string) => {
    if (!url) return null
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      const id = match && match[2].length === 11 ? match[2] : null
      return id ? (
        <iframe
          className="w-full h-40 rounded-lg"
          src={`https://www.youtube.com/embed/${id}`}
          allowFullScreen
          title="Product Video"
        />
      ) : null
    }
    if (url.includes('vimeo.com')) {
      const id = url.split('/').pop()
      return id ? (
        <iframe
          className="w-full h-40 rounded-lg"
          src={`https://player.vimeo.com/video/${id}`}
          allowFullScreen
          title="Product Video"
        />
      ) : null
    }
    return (
      <video src={url} controls className="w-full h-40 rounded-lg bg-black object-cover" />
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue-500" />
          <p className="text-xs text-muted-foreground">Loading Professional dashboard...</p>
        </div>
      </div>
    )
  }

  if (mode !== 'professional') {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shrink-0">
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-5 w-5 text-brand-blue-500" />
            <h1 className="text-lg font-bold tracking-tight text-brand-gradient">
              Professional Mode
            </h1>
            <Badge variant="outline" className="border-brand-blue-500/30 text-brand-blue-500">Discover</Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-brand-blue-500/5">
          <div className="relative max-w-2xl w-full border border-border bg-card/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6 overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-brand-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-brand-blue-500/5 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-brand-gradient p-4 flex items-center justify-center shadow-lg shadow-brand-blue-500/20 transform transition-transform hover:scale-105 duration-300">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight bg-brand-gradient bg-clip-text text-transparent">
                Unlock KuikChat Professional
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Convert your personal account into a discoverable in-app business profile. Access an advanced suite of communication, presentation, and tracking tools.
              </p>
            </div>

            <div className="border-t border-border/60 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-blue-500 mb-4 text-center">
                What's Included in Business Mode
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/40 transition-colors">
                  <div className="p-2 bg-brand-blue-500/10 rounded-lg text-brand-blue-500 mt-0.5 shrink-0">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Business Profile & Catalog</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Showcase your website, contact info, hours, logo, and a visually premium storefront catalog.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/40 transition-colors">
                  <div className="p-2 bg-brand-blue-500/10 rounded-lg text-brand-blue-500 mt-0.5 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Interactive Location Map</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Link your storefront coordinates on a Leaflet map to help users nearby locate your shop.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/40 transition-colors">
                  <div className="p-2 bg-brand-blue-500/10 rounded-lg text-brand-blue-500 mt-0.5 shrink-0">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Broadcast Marketing</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Keep your customer segments engaged with broad update dispatches and promo announcements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/40 transition-colors">
                  <div className="p-2 bg-brand-blue-500/10 rounded-lg text-brand-blue-500 mt-0.5 shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">CRM & Quick Reply Templates</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Save custom templated text shortcuts to reply to repetitive customer questions instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center pt-4">
              <Link href="/settings/profile" passHref legacyBehavior>
                <Button variant="gradient" className="px-8 py-5 text-sm font-bold shadow-lg shadow-brand-blue-500/10 hover:shadow-brand-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Turn on Business Mode in Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <Briefcase className="h-5 w-5 text-brand-blue-500" />
          <h1 className="text-lg font-bold tracking-tight text-brand-gradient">
            Professional Mode
          </h1>
          <Badge variant="gradient">Business</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl bg-card border border-border">
            <TabsTrigger value="analytics" className="text-xs font-semibold">
              <BarChart2 className="mr-1.5 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs font-semibold">
              <Settings className="mr-1.5 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="catalog" className="text-xs font-semibold">
              <Store className="mr-1.5 h-4 w-4" />
              Catalog
            </TabsTrigger>
            <TabsTrigger value="quickreplies" className="text-xs font-semibold">
              <BookOpen className="mr-1.5 h-4 w-4" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="broadcasts" className="text-xs font-semibold">
              <Send className="mr-1.5 h-4 w-4" />
              Broadcasts
            </TabsTrigger>
          </TabsList>

          {/* 1. Analytics Content (Neutral Empty State) */}
          <TabsContent value="analytics" className="space-y-6 outline-none">
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl text-center space-y-4 bg-card/20">
              <div className="p-3 bg-brand-blue-500/10 rounded-full text-brand-blue-500">
                <BarChart2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">No Analytics Data Available</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Analytics tracking is active, but there are no client interactions, campaigns, or invoice payments recorded yet. Metrics will appear automatically once user interactions start.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* 2. Profile Content */}
          <TabsContent value="profile" className="outline-none">
            <form onSubmit={handleSaveProfile} className="grid gap-6 md:grid-cols-3">
              {/* Profile details */}
              <div className="space-y-4 md:col-span-2 rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-sm">Business Settings</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="My Business Ltd." required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Retail, Consulting, AI Developer" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="website" className="pl-9" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" className="pl-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" className="pl-9" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 019-2834" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="addressText">Address / Storefront Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="addressText" className="pl-9" value={addressText} onChange={(e) => setAddressText(e.target.value)} placeholder="123 Main St, New York" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Business Description</Label>
                  <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of what you do..." />
                </div>

                {/* Leaflet map integration */}
                <div className="space-y-2 mt-4">
                  <Label>Interactive Map Pin Location</Label>
                  <LeafletMap value={mapCoords} onChange={(coords) => setMapCoords(coords)} />
                  <p className="text-[10px] text-muted-foreground">
                    Selected coordinates: {mapCoords.lat.toFixed(6)}, {mapCoords.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Uploads & Hours */}
              <div className="space-y-6">
                {/* Images */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h3 className="font-semibold text-sm">Media Attachments</h3>
                  <div className="space-y-3">
                    {/* Logo upload */}
                    <div className="space-y-1">
                      <Label>Business Logo</Label>
                      {logoUrl && (
                        <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-lg border border-border object-contain mb-2 bg-zinc-900" />
                      )}
                      <Input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'logo')} />
                    </div>
                    {/* Cover upload */}
                    <div className="space-y-1">
                      <Label>Cover Banner</Label>
                      {coverUrl && (
                        <img src={coverUrl} alt="Cover" className="w-full h-20 rounded-lg border border-border object-cover mb-2" />
                      )}
                      <Input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'cover')} />
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-blue-500" />
                    Operating Hours
                  </h3>
                  <div className="space-y-2 text-xs">
                    {daysOfWeek.map((day) => {
                      const dayVal = hours[day] || { active: false, open: '09:00', close: '18:00' }
                      return (
                        <div key={day} className="flex items-center justify-between gap-2 py-1">
                          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                            <input
                              type="checkbox"
                              checked={dayVal.active}
                              onChange={(e) => {
                                setHours({
                                  ...hours,
                                  [day]: { ...dayVal, active: e.target.checked }
                                })
                              }}
                              className="rounded border-border"
                            />
                            {day}
                          </label>
                          {dayVal.active ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={dayVal.open}
                                onChange={(e) => {
                                  setHours({
                                    ...hours,
                                    [day]: { ...dayVal, open: e.target.value }
                                  })
                                }}
                                className="w-12 text-center bg-background border border-border rounded py-0.5"
                                placeholder="09:00"
                              />
                              <span>to</span>
                              <input
                                type="text"
                                value={dayVal.close}
                                onChange={(e) => {
                                  setHours({
                                    ...hours,
                                    [day]: { ...dayVal, close: e.target.value }
                                  })
                                }}
                                className="w-12 text-center bg-background border border-border rounded py-0.5"
                                placeholder="18:00"
                              />
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-[11px]">Closed</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Button type="submit" variant="gradient" className="w-full flex items-center justify-center gap-1.5 shadow-lg" disabled={profileLoading}>
                  {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Business Info
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* 3. Catalog Content */}
          <TabsContent value="catalog" className="space-y-6 outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Add New Item Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit">
                <h3 className="font-semibold text-sm">Add Catalog Item</h3>
                <form onSubmit={handleAddCatalog} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input id="itemName" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Consult Seat" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="itemPrice">Price (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="itemPrice" className="pl-9" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="e.g. 49.99" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="itemDesc">Description</Label>
                    <Input id="itemDesc" value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Brief description of service" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="itemVideo">Video Link / Direct MP4 URL</Label>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="itemVideo" className="pl-9" value={newItemVideo} onChange={(e) => setNewItemVideo(e.target.value)} placeholder="e.g. YouTube, Vimeo or MP4 URL" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Product Image</Label>
                    {newItemImage && (
                      <img src={newItemImage} alt="Preview" className="w-full h-20 rounded-lg object-cover border border-border mb-2" />
                    )}
                    <Input type="file" accept="image/*" onChange={handleCatalogImageUpload} disabled={uploadingImage} />
                    {uploadingImage && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin text-brand-blue-500" /> Uploading image...</p>
                    )}
                  </div>
                  <Button type="submit" variant="gradient" className="w-full mt-2" disabled={uploadingImage}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create Item
                  </Button>
                </form>
              </div>

              {/* Items List */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm">Active Catalog Products</h3>
                {catalogLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-blue-500" />
                  </div>
                ) : catalog.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No catalog items added yet. Add your first item on the left!
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {catalog.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border bg-card/60 p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                            <Badge variant="outline" className="text-[10px] text-brand-green-500 border-brand-green-500/30 shrink-0">
                              {item.in_stock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                          
                          {/* Rendering Product Image if exists */}
                          {item.image_urls && item.image_urls.length > 0 && (
                            <img src={item.image_urls[0]} alt={item.name} className="w-full h-28 object-cover rounded-lg border border-border/55 mt-2.5" />
                          )}

                          {/* Video player embed if exists */}
                          {item.video_url && (
                            <div className="mt-2">
                              {renderVideoEmbed(item.video_url)}
                            </div>
                          )}

                          <p className="text-xl font-bold text-brand-blue-500 mt-2">{formatCents(item.price_cents)}</p>
                          <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCatalog(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 4. Quick Replies Content */}
          <TabsContent value="quickreplies" className="space-y-6 outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Add New Quick Reply */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit">
                <h3 className="font-semibold text-sm">Create Shortcut Template</h3>
                <form onSubmit={handleAddReply} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="shortcut">Shortcut Trigger *</Label>
                    <Input id="shortcut" value={newShortcut} onChange={(e) => setNewShortcut(e.target.value)} placeholder="e.g. /thanks" required />
                    <p className="text-[10px] text-muted-foreground">Must begin with a slash (/) symbol</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="replyText">Reply Body *</Label>
                    <Input id="replyText" value={newReplyText} onChange={(e) => setNewReplyText(e.target.value)} placeholder="Type full text message template" required />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full mt-2">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Save Template
                  </Button>
                </form>
              </div>

              {/* Shortcuts list */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm">Configured Shortcuts</h3>
                {repliesLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-blue-500" />
                  </div>
                ) : replies.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No shortcut templates created yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {replies.map((reply) => (
                      <div key={reply.id} className="rounded-xl border border-border bg-card/60 p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <Badge className="font-mono bg-brand-blue-500/10 text-brand-blue-500 border-none hover:bg-brand-blue-500/20">
                            {reply.shortcut}
                          </Badge>
                          <p className="text-xs text-foreground mt-1.5">{reply.body}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0 hover:bg-destructive/10" onClick={() => handleDeleteReply(reply.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 5. Broadcast Lists Content */}
          <TabsContent value="broadcasts" className="space-y-6 outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Create Broadcast List */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit">
                <h3 className="font-semibold text-sm">Create Broadcast List</h3>
                <form onSubmit={handleCreateBroadcast} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="broadcastName">Broadcast List Name</Label>
                    <Input id="broadcastName" value={newBroadcastName} onChange={(e) => setNewBroadcastName(e.target.value)} placeholder="e.g. Premium Customers" />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full mt-2">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create List
                  </Button>
                </form>
              </div>

              {/* Broadcasts List */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm">Active Broadcast Lists</h3>
                <div className="space-y-3">
                  {broadcasts.map((list) => (
                    <div key={list.id} className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{list.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {list.recipients} recipients • Last Sent: {list.lastSent}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-brand-blue-500 hover:bg-brand-blue-500/5 hover:text-brand-blue-600 border-brand-blue-500/30" onClick={() => handleSendBroadcast(list.name)}>
                        <Send className="h-3.5 w-3.5" />
                        Send Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
