'use client'

export const dynamic = 'force-dynamic'

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
import Link from 'next/link'

const CATEGORY_OPTIONS = [
  'Other business',
  'Shopping & retail',
  'Arts & entertainment',
  'Beauty, cosmetic & personal care',
  'Local service',
  'Finance',
  'Travel and transport',
  'Vehicle, aircraft and boat',
  'Non-profit organisation',
  'Residence',
  'Education',
  'Restaurant',
  'Tech & software',
]

const MODES = [
  { id: 'selected', label: 'Open for selected hours' },
  { id: 'always', label: 'Always open (24h)' },
  { id: 'appointment', label: 'By appointment only' }
]

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
  const [activeTab, setActiveTab] = useState('hub')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<string>('personal')
  const [profileExists, setProfileExists] = useState(false)
  const [isWizardActive, setIsWizardActive] = useState(false)

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
  const [categories, setCategories] = useState<string[]>([])
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
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
  const [hoursMode, setHoursMode] = useState<'selected' | 'always' | 'appointment'>('selected')
  const daysOfWeekKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const daysOfWeekLabels: Record<string, string> = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday'
  }
  const [hoursDays, setHoursDays] = useState<Record<string, { active: boolean; open: string; close: string }>>(
    daysOfWeekKeys.reduce((acc, day) => {
      acc[day] = { active: false, open: '09:00', close: '18:00' }
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
  const [broadcasts, setBroadcasts] = useState<any[]>([])
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
        setProfileExists(true)
        setIsWizardActive(false)
        setCompanyName(data.company_name || '')
        setCategories(data.categories || [])
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
          }
          if (loadedHours.mode) {
            setHoursMode(loadedHours.mode)
          }
          
          if (loadedHours.days) {
            const cleanedDays = {} as any
            daysOfWeekKeys.forEach(k => {
              const dayData = loadedHours.days[k];
              if (dayData && typeof dayData === 'object' && !Array.isArray(dayData)) {
                cleanedDays[k] = {
                  active: !!dayData.active,
                  open: dayData.open || '09:00',
                  close: dayData.close || '18:00'
                }
              } else {
                cleanedDays[k] = { active: false, open: '09:00', close: '18:00' }
              }
            })
            setHoursDays(cleanedDays)
          } else {
            // Fallback for older format
            const newDays = {} as any
            daysOfWeekKeys.forEach(k => {
              const oldLabel = daysOfWeekLabels[k];
              const dayData = loadedHours[oldLabel] || loadedHours[k];
              if (dayData && typeof dayData === 'object' && !Array.isArray(dayData)) {
                newDays[k] = {
                  active: !!dayData.active,
                  open: dayData.open || '09:00',
                  close: dayData.close || '18:00'
                }
              } else {
                newDays[k] = { active: false, open: '09:00', close: '18:00' }
              }
            })
            setHoursDays(newDays)
          }
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
      } else {
        setProfileExists(false)
        setIsWizardActive(true)
      }
    } catch (err) {
      console.error('Error loading business profile:', err)
    }
  }

  const handleSaveStep = async (step: number) => {
    setProfileLoading(true)
    try {
      const serializedAddress = JSON.stringify({
        addressText: addressText.trim(),
        lat: mapCoords.lat,
        lng: mapCoords.lng,
      })

      const serializedHours = {
        mode: hoursMode,
        days: hoursDays,
      }

      const payload = {
        user_id: user.id,
        company_name: companyName.trim(),
        categories: categories,
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

      const { error } = await supabase
        .from('business_profiles')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error
      setProfileExists(true)
      
      if (step === 6) {
        setIsWizardActive(false)
        toast.success('Business Profile updated successfully!')
      } else {
        toast.success(`Step ${step} progress saved!`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || `Failed to save step ${step} progress`)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 1 && !companyName.trim()) {
      toast.error('Business Name is required')
      return
    }
    if (currentStep === 2 && categories.length === 0) {
      toast.error('Please select at least one category')
      return
    }

    await handleSaveStep(currentStep)
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCategoryToggle = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat))
    } else {
      if (categories.length >= 3) {
        toast.error('You can select up to 3 categories')
        return
      }
      setCategories([...categories, cat])
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('catalog')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('catalog').getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      if (field === 'logo') {
        setLogoUrl(publicUrl)
      } else {
        setCoverUrl(publicUrl)
      }
      toast.success(`${field === 'logo' ? 'Logo' : 'Cover image'} uploaded! Remember to click Save to keep your changes.`)
    } catch (err: any) {
      console.error(err)
      toast.error(`Failed to upload ${field === 'logo' ? 'logo' : 'cover image'}. Your other fields are safe — click Save to keep them. Then try the image again.`)
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
    <div className="flex h-full flex-col overflow-hidden bg-[#070709] text-[#e7e9f0] biz-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .biz-container {
          --bg: #070709;
          --bg-2: #0b0c10;
          --panel: #0e0f14;
          --panel-2: #121319;
          --panel-3: #171922;
          --line: #1c1e26;
          --line-2: #272a35;
          --text: #e7e9f0;
          --muted: #838a9c;
          --muted-2: #565d6e;
          --blue: hsl(217, 84%, 56%);
          --green: hsl(150, 52%, 42%);
          --accent: hsl(184, 55%, 46%);
          --grad: linear-gradient(135deg, hsl(217, 72%, 50%), hsl(160, 48%, 40%));
          --grad-soft: linear-gradient(135deg, hsl(217 72% 50% / .10), hsl(160 48% 40% / .10));
        }
        
        .biz-iconcluster {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 18px 0 24px;
        }
        
        .biz-tile {
          width: 58px;
          height: 58px;
          border-radius: 15px;
          background: var(--panel-2);
          border: 1px solid var(--line-2);
          display: grid;
          place-items: center;
          color: var(--text);
        }
        
        .biz-tile svg {
          width: 26px;
          height: 26px;
          stroke-width: 1.5;
        }
        
        .biz-tile.tile-1 { color: hsl(217, 80%, 64%); }
        .biz-tile.tile-2 { color: hsl(184, 50%, 56%); }
        .biz-tile.tile-3 { color: hsl(155, 46%, 54%); }
        
        .biz-center {
          text-align: center;
        }
        
        .biz-h1 {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -.02em;
          line-height: 1.2;
          margin-bottom: 8px;
          color: var(--text);
        }
        
        .biz-lead {
          color: var(--muted);
          font-size: 13.5px;
          line-height: 1.55;
          margin-bottom: 20px;
        }
        
        .biz-label {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--muted);
          margin: 0 0 7px;
          display: block;
          letter-spacing: .02em;
          text-transform: uppercase;
        }
        
        .biz-input, .biz-textarea, .biz-select {
          width: 100%;
          background: var(--panel);
          border: 1px solid var(--line-2);
          color: var(--text);
          border-radius: 10px;
          padding: 12px 13px;
          font-size: 13.5px;
          outline: none;
          transition: .15s;
        }
        
        .biz-input:focus, .biz-textarea:focus, .biz-select:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px hsl(217 84% 56% / .12);
        }
        
        .biz-input::placeholder, .biz-textarea::placeholder {
          color: var(--muted-2);
        }
        
        .biz-btn {
          border: 0;
          border-radius: 11px;
          padding: 13px 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          background: var(--grad);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: .16s;
        }
        
        .biz-btn:hover:not(:disabled) {
          filter: brightness(1.07);
        }
        
        .biz-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .biz-btn.ghost {
          background: var(--panel-2);
          border: 1px solid var(--line-2);
          color: var(--text);
        }
        
        .biz-field {
          margin-bottom: 18px;
        }
        
        .biz-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .biz-chip {
          font-size: 12px;
          font-weight: 550;
          padding: 9px 14px;
          border-radius: 8px;
          border: 1px solid var(--line-2);
          color: var(--muted);
          cursor: pointer;
          background: var(--panel);
          transition: .14s;
          user-select: none;
        }
        
        .biz-chip:hover {
          color: var(--text);
          border-color: var(--muted-2);
        }
        
        .biz-chip.on {
          background: var(--grad-soft);
          border-color: var(--blue);
          color: #fff;
        }
        
        .biz-seemore {
          color: hsl(155, 46%, 54%);
          font-weight: 600;
          font-size: 12.5px;
          text-align: center;
          margin-top: 16px;
          cursor: pointer;
        }
        
        .biz-hoursrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
        }
        
        .biz-hoursrow:last-child {
          border-bottom: 0;
        }
        
        .biz-hoursrow .day {
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 13.5px;
          font-weight: 550;
          color: var(--text);
        }
        
        .biz-toggle {
          width: 40px;
          height: 23px;
          border-radius: 999px;
          background: var(--line-2);
          position: relative;
          cursor: pointer;
          flex: 0 0 40px;
          transition: .18s;
        }
        
        .biz-toggle::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          width: 19px;
          height: 19px;
          border-radius: 50%;
          background: #fff;
          transition: .18s;
        }
        
        .biz-toggle.on {
          background: var(--grad);
        }
        
        .biz-toggle.on::after {
          left: 19px;
        }
        
        .biz-timepill-input {
          background: var(--panel);
          border: 1px solid var(--line-2);
          border-radius: 7px;
          padding: 6px 9px;
          font-size: 12px;
          color: var(--text);
          width: 65px;
          text-align: center;
          outline: none;
          font-variant-numeric: tabular-nums;
          transition: border-color 0.15s;
        }
        
        .biz-timepill-input:focus {
          border-color: var(--blue);
        }
        
        .biz-hoursmode {
          display: flex;
          flex-direction: column;
        }
        
        .biz-moderow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 12px;
          border-bottom: 1px solid var(--line);
          cursor: pointer;
          font-size: 14px;
          color: var(--muted);
          background: var(--panel);
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid var(--line-2);
          transition: .14s;
        }
        
        .biz-moderow:last-child {
          margin-bottom: 0;
        }
        
        .biz-moderow.on {
          color: var(--text);
          font-weight: 600;
          border-color: var(--blue);
          background: var(--panel-2);
        }
        
        .biz-moderow .chk {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid var(--line-2);
          display: grid;
          place-items: center;
        }
        
        .biz-moderow.on .chk {
          border-color: var(--blue);
          background: var(--grad);
        }
        
        .biz-moderow.on .chk svg {
          width: 11px;
          height: 11px;
          stroke: #fff;
          stroke-width: 2.4;
        }
        
        .biz-progress {
          height: 3px;
          border-radius: 999px;
          background: var(--line);
          overflow: hidden;
          margin: 8px 0 24px;
        }
        
        .biz-progress > i {
          display: block;
          height: 100%;
          background: var(--grad);
          border-radius: 999px;
        }
        
        .biz-filebox {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--panel);
          border: 1px solid var(--line-2);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 12.5px;
          color: var(--muted);
          position: relative;
          cursor: pointer;
          min-height: 44px;
        }
        
        .biz-filebox .b {
          background: var(--panel-3);
          border: 1px solid var(--line-2);
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11.5px;
          color: var(--text);
          font-weight: 600;
        }
        
        .biz-filebox input[type="file"] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        
        .biz-iconinput {
          position: relative;
        }
        
        .biz-iconinput .lic {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-2);
        }
        
        .biz-iconinput .input {
          padding-left: 38px;
        }
        
        .biz-note {
          margin-top: 16px;
          font-size: 11.5px;
          color: var(--muted-2);
          text-align: center;
          line-height: 1.65;
        }
      ` }} />

      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--panel)] px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-[var(--grad)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 stroke-[#fff] fill-none stroke-[1.8]"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.38 8.38 0 0 1 8.5 8.5z"/></svg>
          </span>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            KuikChat Professional
          </h1>
          <Badge className="bg-[var(--panel-3)] border border-[var(--line-2)] text-[var(--muted)] hover:bg-[var(--panel-3)]">Business</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Back button / breadcrumb — shown when not on hub */}
          {activeTab !== 'hub' && profileExists && !isWizardActive && (
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setActiveTab('hub')}
                className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M15 19l-7-7 7-7"/>
                </svg>
                Business Hub
              </button>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-[var(--muted-2)]">
                <path d="M9 18l6-6-6-6"/>
              </svg>
              <span className="text-xs text-[var(--text)] capitalize font-medium">
                {activeTab === 'profile' ? 'Profile' : activeTab === 'catalog' ? 'Catalog' : activeTab === 'quickreplies' ? 'Quick Replies' : activeTab === 'broadcasts' ? 'Broadcasts' : activeTab}
              </span>
            </div>
          )}

          {/* HUB HOME VIEW */}
          <TabsContent value="hub" className="outline-none">
            {profileExists && !isWizardActive ? (
              <div className="space-y-4 max-w-2xl">

                {/* For You — Promo Card */}
                <div className="rounded-xl border border-[var(--blue)]/30 bg-[var(--grad-soft)] p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[var(--text)] mb-0.5">Upgrade to Business Pro</p>
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">Unlock verified badge, priority support &amp; advanced analytics</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast('Coming soon')}
                    className="shrink-0 biz-btn ghost text-xs px-3 py-2 rounded-lg"
                    style={{ fontSize: '11px', padding: '7px 14px', borderRadius: '8px' }}
                  >
                    Learn more
                  </button>
                </div>

                {/* GROUP: Grow */}
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[var(--muted)] font-semibold mb-2 px-1">Grow</p>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] overflow-hidden divide-y divide-[var(--line)]">
                    {/* Catalog */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('catalog')}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--panel-2)] transition-colors text-left"
                    >
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[hsl(184,50%,56%)]">
                        <Store className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)]">Catalog</p>
                        <p className="text-[11px] text-[var(--muted)]">List your products &amp; services</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                    {/* Broadcasts */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('broadcasts')}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--panel-2)] transition-colors text-left"
                    >
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[hsl(155,46%,54%)]">
                        <Send className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)]">Broadcasts</p>
                        <p className="text-[11px] text-[var(--muted)]">Send messages to multiple contacts</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* GROUP: Organize */}
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[var(--muted)] font-semibold mb-2 px-1">Organize</p>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] overflow-hidden divide-y divide-[var(--line)]">
                    {/* Lists & Labels — Coming Soon */}
                    <div className="w-full flex items-center gap-3 px-4 py-3.5 opacity-50 cursor-not-allowed">
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[var(--muted)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: '18px', height: '18px' }}>
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="1"/>
                          <path d="M9 12h6M9 16h4"/>
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--text)]">Lists &amp; Labels</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--panel-3)] border border-[var(--line-2)] text-[var(--muted)] px-1.5 py-0.5 rounded-full">Soon</span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)]">Organise contacts with lists &amp; tags</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    {/* Greeting message — Coming Soon */}
                    <div className="w-full flex items-center gap-3 px-4 py-3.5 opacity-50 cursor-not-allowed">
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[var(--muted)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: '18px', height: '18px' }}>
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          <path d="M8 10h.01M12 10h.01M16 10h.01"/>
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--text)]">Greeting message</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--panel-3)] border border-[var(--line-2)] text-[var(--muted)] px-1.5 py-0.5 rounded-full">Soon</span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)]">Auto-send a welcome to new contacts</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    {/* Away message — Coming Soon */}
                    <div className="w-full flex items-center gap-3 px-4 py-3.5 opacity-50 cursor-not-allowed">
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[var(--muted)]">
                        <Clock className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--text)]">Away message</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--panel-3)] border border-[var(--line-2)] text-[var(--muted)] px-1.5 py-0.5 rounded-full">Soon</span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)]">Reply automatically when you&apos;re away</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    {/* Quick Replies */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('quickreplies')}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--panel-2)] transition-colors text-left"
                    >
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[hsl(217,80%,64%)]">
                        <BookOpen className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)]">Quick replies</p>
                        <p className="text-[11px] text-[var(--muted)]">Shortcut templates for fast replies</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                    {/* Connect Instagram & Facebook — Coming Soon */}
                    <div className="w-full flex items-center gap-3 px-4 py-3.5 opacity-50 cursor-not-allowed">
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[var(--muted)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: '18px', height: '18px' }}>
                          <rect x="2" y="2" width="20" height="20" rx="5"/>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--text)]">Connect Instagram &amp; Facebook</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--panel-3)] border border-[var(--line-2)] text-[var(--muted)] px-1.5 py-0.5 rounded-full">Soon</span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)]">Sync messages from your social pages</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* GROUP: Manage */}
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[var(--muted)] font-semibold mb-2 px-1">Manage</p>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] overflow-hidden divide-y divide-[var(--line)]">
                    {/* Profile */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--panel-2)] transition-colors text-left"
                    >
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[hsl(217,80%,64%)]">
                        <Settings className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)]">Profile</p>
                        <p className="text-[11px] text-[var(--muted)]">Business name, category, contact info</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                    {/* Branding */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--panel-2)] transition-colors text-left"
                    >
                      <span className="w-9 h-9 rounded-lg bg-[var(--panel-3)] border border-[var(--line-2)] grid place-items-center shrink-0 text-[hsl(155,46%,54%)]">
                        <ImageIcon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)]">Branding</p>
                        <p className="text-[11px] text-[var(--muted)]">Logo, cover image, gallery</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--muted-2)] shrink-0">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* How to get started */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-3">
                  <p className="text-xs font-bold text-[var(--text)]">How to get started</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[var(--grad)] text-white text-[9px] font-bold grid place-items-center shrink-0 mt-0.5">1</span>
                      <p className="text-[12px] text-[var(--muted)] leading-snug">Complete your profile</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[var(--grad)] text-white text-[9px] font-bold grid place-items-center shrink-0 mt-0.5">2</span>
                      <p className="text-[12px] text-[var(--muted)] leading-snug">Add your first catalog item</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[var(--grad)] text-white text-[9px] font-bold grid place-items-center shrink-0 mt-0.5">3</span>
                      <p className="text-[12px] text-[var(--muted)] leading-snug">Share your business link</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Redirect to profile to complete setup first */
              <div className="text-center py-12">
                <p className="text-sm text-[var(--muted)] mb-4">Set up your business profile to unlock the hub</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="biz-btn px-6 py-2.5"
                >
                  Get Started
                </button>
              </div>
            )}
          </TabsContent>

          {/* 2. Profile Content */}
          <TabsContent value="profile" className="outline-none">
            {(!profileExists || isWizardActive) ? (
              /* Stepped Setup Wizard (Centered, No Sidebar, No Tabs) */
              <div className="max-w-md w-full mx-auto bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-2xl relative overflow-hidden my-6">
                {/* Wizard Header with back arrow and progress bar */}
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center justify-between">
                    {currentStep > 1 ? (
                      <button 
                        onClick={handlePrevStep} 
                        className="text-[var(--muted)] hover:text-white transition-colors"
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M15 19l-7-7 7-7"/></svg>
                      </button>
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                    {currentStep > 1 && (
                      <span className="text-xs text-[var(--muted)] font-semibold">
                        Step {currentStep} of 6
                      </span>
                    )}
                    <div className="w-5 h-5" />
                  </div>
                  {currentStep > 1 && (
                    <div className="biz-progress">
                      <i style={{ width: `${(currentStep / 6) * 100}%` }} />
                    </div>
                  )}
                </div>

                <div className="min-h-[300px] flex flex-col justify-between">
                  {/* Step Contents */}
                  <div className="flex-1 pb-6">
                    {/* Step 1: Basics */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="biz-iconcluster">
                          <div className="biz-tile tile-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l1.5-5h15L21 9M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9zM4 9a3 3 0 0 0 5 0 3 3 0 0 0 6 0 3 3 0 0 0 5 0"/></svg>
                          </div>
                          <div className="biz-tile tile-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </div>
                          <div className="biz-tile tile-3">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          </div>
                        </div>
                        <div className="biz-center">
                          <div className="biz-h1">Create your<br />business profile</div>
                          <p className="biz-lead">Tell potential customers about your business with an easy, professional setup.</p>
                        </div>
                        <div className="biz-field">
                          <span className="biz-label">Business name</span>
                          <input 
                            type="text"
                            id="companyName" 
                            value={companyName} 
                            onChange={(e) => setCompanyName(e.target.value)} 
                            placeholder="Enter your business name" 
                            className="biz-input"
                            required 
                          />
                        </div>
                        <p className="biz-note">Your KuikChat business profile is visible to any logged-in user.</p>
                      </div>
                    )}

                    {/* Step 2: Category */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="biz-center">
                          <div className="biz-h1">Select your<br />business category</div>
                          <p className="biz-lead">Choose up to three categories to show on your business profile.</p>
                        </div>

                        <div className="space-y-4">
                          <div className="biz-chips">
                            {(showAllCategories ? CATEGORY_OPTIONS : CATEGORY_OPTIONS.slice(0, 10)).map((opt) => {
                              const isSelected = categories.includes(opt);
                              return (
                                <div
                                  key={opt}
                                  onClick={() => handleCategoryToggle(opt)}
                                  className={`biz-chip ${isSelected ? 'on' : ''}`}
                                >
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                          <div 
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="biz-seemore"
                          >
                            {showAllCategories ? 'Show fewer categories' : '+ See more categories'}
                          </div>
                        </div>

                        {/* Quick Search Dropdown on Setup */}
                        <div className="space-y-1.5 pt-4 border-t border-[var(--line)]">
                          <span className="biz-label">Quick Search / Select Category</span>
                          <select
                            id="categorySelect"
                            value=""
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                handleCategoryToggle(val);
                                e.target.value = "";
                              }
                            }}
                            className="biz-select text-xs"
                            disabled={categories.length >= 3}
                          >
                            <option value="">
                              {categories.length >= 3 ? 'Max categories selected' : 'Choose a category...'}
                            </option>
                            {CATEGORY_OPTIONS.filter(opt => !categories.includes(opt)).map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Hours */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="biz-center">
                          <div className="biz-h1">Add your<br />business hours</div>
                          <p className="biz-lead">Let customers know when you open and close each day.</p>
                        </div>

                        <div className="biz-hoursmode space-y-2">
                          {MODES.map((m) => {
                            const isSelected = hoursMode === m.id;
                            return (
                              <div
                                key={m.id}
                                onClick={() => setHoursMode(m.id as any)}
                                className={`biz-moderow ${isSelected ? 'on' : ''}`}
                                style={{ marginBottom: 0 }}
                              >
                                <span>{m.label}</span>
                                <div className="chk">
                                  {isSelected && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {hoursMode === 'selected' && (
                          <div className="mt-4 bg-[var(--panel-2)] border border-[var(--line)] rounded-xl p-4 space-y-1">
                            {daysOfWeekKeys.map((day) => {
                              const dayVal = hoursDays[day] || { active: false, open: '09:00', close: '18:00' };
                              return (
                                <div key={day} className="biz-hoursrow flex items-center justify-between py-2.5 border-b border-[var(--line)] last:border-b-0">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-xs capitalize text-[var(--text)]">{daysOfWeekLabels[day]}</span>
                                    {dayVal.active ? (
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <input
                                          type="text"
                                          value={dayVal.open}
                                          onChange={(e) => {
                                            setHoursDays({
                                              ...hoursDays,
                                              [day]: { ...dayVal, open: e.target.value }
                                            })
                                          }}
                                          className="biz-timepill-input"
                                          placeholder="09:00"
                                        />
                                        <span className="text-[var(--muted-2)] text-xs">–</span>
                                        <input
                                          type="text"
                                          value={dayVal.close}
                                          onChange={(e) => {
                                            setHoursDays({
                                              ...hoursDays,
                                              [day]: { ...dayVal, close: e.target.value }
                                            })
                                          }}
                                          className="biz-timepill-input"
                                          placeholder="18:00"
                                        />
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-[var(--muted-2)] mt-0.5">Closed</span>
                                    )}
                                  </div>
                                  <div 
                                    onClick={() => {
                                      setHoursDays({
                                        ...hoursDays,
                                        [day]: { ...dayVal, active: !dayVal.active }
                                      })
                                    }}
                                    className={`biz-toggle ${dayVal.active ? 'on' : ''}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Branding */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div className="biz-center">
                          <div className="biz-h1">Upload your<br />branding</div>
                          <p className="biz-lead">Add your business logo and cover image to personalize your storefront.</p>
                        </div>
                        <div className="space-y-4 pt-2">
                          <div className="biz-field">
                            <span className="biz-label">Business Logo</span>
                            <div className="biz-filebox">
                              <span className="b">Choose file</span>
                              <span className="truncate">{logoUrl ? 'logo.png (uploaded)' : 'No file chosen'}</span>
                              <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'logo')} />
                            </div>
                            {logoUrl && (
                              <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-lg border border-[var(--line-2)] object-contain mt-2 bg-zinc-900" />
                            )}
                            <p className="hint">Square image recommended (256×256)</p>
                          </div>
                          <div className="biz-field">
                            <span className="biz-label">Cover / Banner Image</span>
                            <div className="biz-filebox">
                              <span className="b">Choose file</span>
                              <span className="truncate">{coverUrl ? 'cover.jpg (uploaded)' : 'No file chosen'}</span>
                              <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'cover')} />
                            </div>
                            {coverUrl && (
                              <img src={coverUrl} alt="Cover" className="w-full h-20 rounded-lg border border-[var(--line-2)] object-cover mt-2" />
                            )}
                            <p className="hint">Wide landscape image (e.g. 1200×400)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Location & Contact */}
                    {currentStep === 5 && (
                      <div className="space-y-4">
                        <div className="biz-center">
                          <div className="biz-h1">Location &amp;<br />Contact Info</div>
                          <p className="biz-lead">Provide your storefront address, website, and contact information.</p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="biz-field">
                            <span className="biz-label">Website</span>
                            <div className="biz-iconinput">
                              <span className="lic">
                                <svg className="ic w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>
                              </span>
                              <input 
                                type="text"
                                id="website" 
                                value={website} 
                                onChange={(e) => setWebsite(e.target.value)} 
                                placeholder="https://example.com" 
                                className="biz-input pl-10"
                              />
                            </div>
                          </div>

                          <div className="biz-field">
                            <span className="biz-label">Business Email</span>
                            <div className="biz-iconinput">
                              <span className="lic">
                                <svg className="ic w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                              </span>
                              <input 
                                type="email"
                                id="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="contact@example.com" 
                                className="biz-input pl-10"
                              />
                            </div>
                          </div>

                          <div className="biz-field">
                            <span className="biz-label">Phone</span>
                            <div className="biz-iconinput">
                              <span className="lic">
                                <svg className="ic w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z"/></svg>
                              </span>
                              <input 
                                type="text"
                                id="phone" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="+1 (555) 019-2834" 
                                className="biz-input pl-10"
                              />
                            </div>
                          </div>

                          <div className="biz-field">
                            <span className="biz-label">Address</span>
                            <div className="biz-iconinput">
                              <span className="lic">
                                <svg className="ic w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              </span>
                              <input 
                                type="text"
                                id="addressText" 
                                value={addressText} 
                                onChange={(e) => setAddressText(e.target.value)} 
                                placeholder="123 Main St, New York" 
                                className="biz-input pl-10"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Description */}
                    {currentStep === 6 && (
                      <div className="space-y-4">
                        <div className="biz-center">
                          <div className="biz-h1">About /<br />Description</div>
                          <p className="biz-lead">Tell customers about your business, what you offer, and what makes you stand out.</p>
                        </div>
                        <div className="biz-field pt-2">
                          <span className="biz-label">About / Description</span>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell customers about your business, what you offer, and what makes you stand out…"
                            rows={6}
                            className="biz-textarea"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wizard Continue Button */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="biz-btn w-full mt-4 flex items-center justify-center gap-1.5"
                    disabled={profileLoading}
                  >
                    {profileLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : currentStep === 6 ? (
                      'Save & Finish'
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Settings Dashboard (Tabs + Two-Column Settings, Screen 8) */
              <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Business Settings Card (col-span-2) */}
                <div className="space-y-6 md:col-span-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
                  <h3 className="text-sm font-bold border-b border-[var(--line)] pb-3 flex items-center gap-2 text-[#e7e9f0]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--muted)]"><path d="M12 20h9M3 20v-8c0-2.2 1.8-4 4-4h10c2.2 0 4 1.8 4 4v8M3 12h18M12 2v6"/></svg>
                    Business Settings
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="biz-field">
                      <span className="biz-label">Business Name *</span>
                      <input 
                        type="text" 
                        id="companyName"
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                        className="biz-input" 
                        placeholder="e.g. AtlasLM"
                        required
                      />
                    </div>
                    <div className="biz-field">
                      <span className="biz-label">Category *</span>
                      <div className="biz-chips mb-2 mt-1">
                        {categories.map((c) => (
                          <span 
                            key={c} 
                            onClick={() => handleCategoryToggle(c)} 
                            className="biz-chip on"
                          >
                            {c} <span className="text-[9px] ml-1">×</span>
                          </span>
                        ))}
                      </div>
                      <select
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handleCategoryToggle(val);
                            e.target.value = "";
                          }
                        }}
                        className="biz-select text-xs py-2"
                        disabled={categories.length >= 3}
                      >
                        <option value="">
                          {categories.length >= 3 ? 'Max 3 categories selected' : 'Add category...'}
                        </option>
                        {CATEGORY_OPTIONS.filter(opt => !categories.includes(opt)).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="biz-field">
                      <span className="biz-label">Website</span>
                      <div className="biz-iconinput">
                        <span className="lic">
                          <svg className="ic w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>
                        </span>
                        <input 
                          type="text" 
                          value={website} 
                          onChange={(e) => setWebsite(e.target.value)} 
                          className="biz-input pl-10" 
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div className="biz-field">
                      <span className="biz-label">Business Email</span>
                      <div className="biz-iconinput">
                        <span className="lic">
                          <svg className="ic w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                        </span>
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="biz-input pl-10" 
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="biz-field">
                      <span className="biz-label">Phone</span>
                      <div className="biz-iconinput">
                        <span className="lic">
                          <svg className="ic w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z"/></svg>
                        </span>
                        <input 
                          type="text" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="biz-input pl-10" 
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                    <div className="biz-field">
                      <span className="biz-label">Address</span>
                      <div className="biz-iconinput">
                        <span className="lic">
                          <svg className="ic w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </span>
                        <input 
                          type="text" 
                          value={addressText} 
                          onChange={(e) => setAddressText(e.target.value)} 
                          className="biz-input pl-10" 
                          placeholder="123 Main St, Vienna"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="biz-field">
                    <span className="biz-label">About / Description</span>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      rows={5} 
                      className="biz-textarea" 
                      placeholder="Describe your business..."
                    />
                  </div>

                  {/* Save button and run wizard link */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
                    <button 
                      onClick={() => {
                        setIsWizardActive(true);
                        setCurrentStep(1);
                      }}
                      className="text-xs text-[var(--muted)] hover:text-white underline transition-colors"
                      type="button"
                    >
                      Re-run Setup Wizard
                    </button>

                    <button 
                      onClick={async () => {
                        if (!companyName.trim()) {
                          toast.error('Business Name is required');
                          return;
                        }
                        if (categories.length === 0) {
                          toast.error('Please select at least one category');
                          return;
                        }
                        await handleSaveStep(6);
                      }}
                      disabled={profileLoading}
                      className="biz-btn px-6 py-2.5"
                      type="button"
                    >
                      {profileLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Save Settings'
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Column: Branding & Hours cards */}
                <div className="space-y-6 col-span-1">
                  {/* Branding Card */}
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-4">
                    <h3 className="text-xs font-bold border-b border-[var(--line)] pb-3 flex items-center gap-2 text-[#e7e9f0]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--muted)]"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      Branding
                    </h3>
                    <div className="biz-field">
                      <span className="biz-label">Business Logo</span>
                      <div className="biz-filebox">
                        <span className="b">Choose file</span>
                        <span className="truncate">{logoUrl ? 'logo.png (uploaded)' : 'No file chosen'}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'logo')} />
                      </div>
                      {logoUrl && (
                        <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-lg border border-[var(--line-2)] object-contain mt-2 bg-zinc-900" />
                      )}
                    </div>
                    <div className="biz-field">
                      <span className="biz-label">Cover / Banner</span>
                      <div className="biz-filebox">
                        <span className="b">Choose file</span>
                        <span className="truncate">{coverUrl ? 'cover.jpg (uploaded)' : 'No file chosen'}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'cover')} />
                      </div>
                      {coverUrl && (
                        <img src={coverUrl} alt="Cover" className="w-full h-14 rounded-lg border border-[var(--line-2)] object-cover mt-2" />
                      )}
                    </div>
                  </div>

                  {/* Operating Hours Card */}
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-4">
                    <h3 className="text-xs font-bold border-b border-[var(--line)] pb-3 flex items-center gap-2 text-[#e7e9f0]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--muted)]"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                      Opening Hours
                    </h3>
                    <div className="biz-hoursmode space-y-2">
                      {MODES.map((m) => {
                        const isSelected = hoursMode === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => setHoursMode(m.id as any)}
                            className={`biz-moderow py-2 px-3 text-xs mb-0 ${isSelected ? 'on' : ''}`}
                            style={{ marginBottom: 0 }}
                          >
                            <span>{m.label}</span>
                            <div className="chk">
                              {isSelected && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {hoursMode === 'selected' && (
                      <div className="bg-[var(--panel-2)] border border-[var(--line)] rounded-xl p-3 space-y-1 mt-2">
                        {daysOfWeekKeys.map((day) => {
                          const dayVal = hoursDays[day] || { active: false, open: '09:00', close: '18:00' };
                          return (
                            <div key={day} className="biz-hoursrow flex items-center justify-between py-2 border-b border-[var(--line)] last:border-b-0">
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs capitalize text-[var(--text)]">{daysOfWeekLabels[day]}</span>
                                {dayVal.active ? (
                                  <div className="flex items-center gap-1 mt-1">
                                    <input
                                      type="text"
                                      value={dayVal.open}
                                      onChange={(e) => {
                                        setHoursDays({
                                          ...hoursDays,
                                          [day]: { ...dayVal, open: e.target.value }
                                        })
                                      }}
                                      className="biz-timepill-input h-7 py-1 px-2 text-[11px] w-[55px]"
                                      placeholder="09:00"
                                    />
                                    <span className="text-[var(--muted-2)] text-[10px]">–</span>
                                    <input
                                      type="text"
                                      value={dayVal.close}
                                      onChange={(e) => {
                                        setHoursDays({
                                          ...hoursDays,
                                          [day]: { ...dayVal, close: e.target.value }
                                        })
                                      }}
                                      className="biz-timepill-input h-7 py-1 px-2 text-[11px] w-[55px]"
                                      placeholder="18:00"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-[var(--muted-2)] mt-0.5">Closed</span>
                                )}
                              </div>
                              <div 
                                onClick={() => {
                                  setHoursDays({
                                    ...hoursDays,
                                    [day]: { ...dayVal, active: !dayVal.active }
                                  })
                                }}
                                className={`biz-toggle ${dayVal.active ? 'on' : ''}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                  {broadcasts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-2)]/30 p-8 text-center">
                      <p className="text-sm text-[var(--muted-2)]">No broadcast lists yet</p>
                    </div>
                  ) : (
                    broadcasts.map((list) => (
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
