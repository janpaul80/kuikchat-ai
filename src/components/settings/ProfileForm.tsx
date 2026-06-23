'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, QrCode as QrIcon, Check, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SettingsSection } from '@/components/settings/SettingsSection'
import { getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

interface ProfileFormProps {
  initialProfile: {
    id: string
    username: string
    display_name: string
    bio: string | null
    avatar_url: string | null
    email: string | null
    mode: string
  }
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(initialProfile.display_name)
  const [username, setUsername] = useState(initialProfile.username)
  const [bio, setBio] = useState(initialProfile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [origin, setOrigin] = useState('https://kuikchat.io')
  const [isBusinessMode, setIsBusinessMode] = useState(initialProfile.mode === 'professional')

  const handleModeToggle = async (checked: boolean) => {
    const newMode = checked ? 'professional' : 'personal'
    setIsBusinessMode(checked)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ mode: newMode })
        .eq('id', initialProfile.id)

      if (error) throw error

      toast.success(`Business Mode turned ${checked ? 'on' : 'off'} successfully!`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update Business Mode')
      setIsBusinessMode(!checked)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Generate QR Code
  useEffect(() => {
    if (!canvasRef.current || !username) return
    const profileLink = `${origin}/add/${username}`
    QRCode.toCanvas(
      canvasRef.current,
      profileLink,
      {
        width: 128,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      },
      (error) => {
        if (error) console.error('Error generating QR code:', error)
      }
    )
  }, [username])

  // Download QR Code as PNG
  const downloadQrCode = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `kuikchat-qr-${username || 'profile'}.png`
    link.click()
  }

  // Handle Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${initialProfile.id}-${Math.random()}.${fileExt}`

      // Upload file to Supabase storage bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = data.publicUrl
      setAvatarUrl(publicUrl)

      // Update avatar_url directly in DB
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', initialProfile.id)

      if (dbError) throw dbError

      toast.success('Profile photo updated successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // Handle Profile Save
  const handleSave = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty')
      return
    }
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      toast.error('Username must be 3-30 lowercase characters, numbers, or underscores')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: username.trim(),
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialProfile.id)

      if (error) throw error
      toast.success('Profile updated successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection title="Profile photo">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border border-border">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-brand-gradient p-4">
                <img src="/logo.png" alt="KuikChat" className="h-full w-full object-contain" />
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg ring-2 ring-card hover:opacity-90">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div className="flex-1">
            <Button variant="outline" className="relative">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <label className="cursor-pointer">
                    Upload photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </>
              )}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG or GIF. Max 5MB. Square images work best.
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Personal info">
        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" />
          <p className="text-xs text-muted-foreground">
            This is how your name appears in chats and groups.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            People can find and add you using @{username || 'yourname'}.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={initialProfile.email || ''} disabled />
        </div>
      </SettingsSection>

      <SettingsSection title="Business Mode">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label htmlFor="business-mode-toggle" className="text-sm font-medium">Business Mode</Label>
            <p className="text-xs text-muted-foreground">
              Turn on Business Mode to unlock professional tools, customize your company profile, create a product catalog, and more.
            </p>
          </div>
          <Switch
            id="business-mode-toggle"
            checked={isBusinessMode}
            onCheckedChange={handleModeToggle}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Your QR code">
        <div className="flex items-center gap-6">
          <div className="flex h-36 w-36 items-center justify-center border border-border bg-white p-2.5 rounded-xl">
            <canvas ref={canvasRef} className="h-full w-full object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Share your QR code so others can add you instantly without needing a phone number.
            </p>
            <Button variant="outline" className="mt-3" size="sm" onClick={downloadQrCode}>
              Download QR
            </Button>
          </div>
        </div>
      </SettingsSection>

      <div className="flex justify-end gap-3">
        <Button variant="gradient" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </div>
  )
}
