'use client'

import { useEffect, useState } from 'react'
import {
  HardDrive,
  ImageIcon,
  Video,
  FileText,
  Mic,
  Trash2,
  Loader2,
  Server,
  Download,
  Wifi,
  Smartphone,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { SettingsSection, SettingsRow } from '@/components/settings/SettingsSection'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface StorageFile {
  id: string
  bucket: string
  name: string
  size: number
  created_at: string
  mimetype: string | null
}

interface StorageData {
  plan: string
  totalUsed: number
  quotaBytes: number
  breakdown: {
    photos: number
    videos: number
    voice: number
    documents: number
  }
  files: StorageFile[]
  headroom: {
    totalProvisioned: number
    totalUsed: number
    physicalDiskPool: number
    oversubscriptionRatio: number
  }
}

export function StorageForm() {
  const supabase = createClient()
  const [data, setData] = useState<StorageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Auto-download preferences
  const [autoWifi, setAutoWifi] = useState<string[]>([])
  const [autoMobile, setAutoMobile] = useState<string[]>([])

  useEffect(() => {
    // Load preferences from localStorage
    const savedWifi = localStorage.getItem('kc-autodownload-wifi')
    const savedMobile = localStorage.getItem('kc-autodownload-mobile')
    if (savedWifi) setAutoWifi(JSON.parse(savedWifi))
    else setAutoWifi(['photos', 'voice', 'videos', 'documents'])
    if (savedMobile) setAutoMobile(JSON.parse(savedMobile))
    else setAutoMobile(['photos'])

    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/storage/usage')
      if (!res.ok) throw new Error('Failed to load storage details')
      const payload = await res.json()
      setData(payload)
    } catch (err: any) {
      console.error(err)
      toast.error('Could not load storage data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFile = async (file: StorageFile) => {
    setDeletingId(file.id)
    try {
      const { error } = await supabase.storage.from(file.bucket).remove([file.name])
      if (error) throw error

      toast.success('File deleted successfully')
      // Refetch storage usage
      await fetchUsage()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to delete file')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleWifiPreference = (type: string) => {
    const next = autoWifi.includes(type)
      ? autoWifi.filter((x) => x !== type)
      : [...autoWifi, type]
    setAutoWifi(next)
    localStorage.setItem('kc-autodownload-wifi', JSON.stringify(next))
    toast.success('Auto-download settings updated')
  }

  const toggleMobilePreference = (type: string) => {
    const next = autoMobile.includes(type)
      ? autoMobile.filter((x) => x !== type)
      : [...autoMobile, type]
    setAutoMobile(next)
    localStorage.setItem('kc-autodownload-mobile', JSON.stringify(next))
    toast.success('Auto-download settings updated')
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue-500" />
      </div>
    )
  }

  const usedPercentage = Math.min((data.totalUsed / data.quotaBytes) * 100, 100)

  return (
    <div className="space-y-6">
      {/* 1. Storage Usage Overview */}
      <SettingsSection title="Storage usage">
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue-500/10 text-brand-blue-500">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatSize(data.totalUsed)}</p>
              <p className="text-xs text-muted-foreground">
                used out of {formatSize(data.quotaBytes)} (KuikChat Server)
              </p>
            </div>
            <Badge variant="outline" className="ml-auto capitalize">
              {data.plan} plan
            </Badge>
          </div>

          <div className="space-y-1">
            <Progress value={usedPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{usedPercentage.toFixed(1)}% used</span>
              <span>{formatSize(data.quotaBytes - data.totalUsed)} remaining</span>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-4">
          {[
            { label: 'Photos', key: 'photos', color: 'bg-brand-blue-500', icon: ImageIcon },
            { label: 'Videos', key: 'videos', color: 'bg-brand-green-500', icon: Video },
            { label: 'Voice', key: 'voice', color: 'bg-purple-500', icon: Mic },
            { label: 'Documents', key: 'documents', color: 'bg-teal-500', icon: FileText },
          ].map((cat) => {
            const size = data.breakdown[cat.key as keyof typeof data.breakdown] || 0
            const Icon = cat.icon
            return (
              <div key={cat.label} className="rounded-xl border border-border bg-card/40 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(size)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </SettingsSection>

      {/* 2. File Cleanup Tool */}
      <SettingsSection title="File cleanup">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Review and delete files you've sent or uploaded to reclaim storage space.
          </p>
          <div className="divide-y divide-border max-h-60 overflow-y-auto pr-1">
            {data.files.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No uploaded files found.
              </p>
            ) : (
              data.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between py-2 text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="truncate font-medium text-foreground">{file.name.split('/').pop()}</p>
                    <p className="text-muted-foreground mt-0.5">
                      {formatSize(file.size)} • {file.mimetype || 'Unknown type'}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    disabled={deletingId === file.id}
                    onClick={() => handleDeleteFile(file)}
                  >
                    {deletingId === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </SettingsSection>

      {/* 3. Auto-download Preferences */}
      <SettingsSection title="Auto-download">
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-4 bg-card/20 space-y-3">
            <div className="flex items-center gap-2 font-medium text-sm">
              <Wifi className="h-4 w-4 text-brand-blue-500" />
              <span>When connected to WiFi</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['photos', 'videos', 'voice', 'documents'].map((type) => {
                const active = autoWifi.includes(type)
                return (
                  <Button
                    key={type}
                    size="sm"
                    variant={active ? 'gradient' : 'outline'}
                    onClick={() => toggleWifiPreference(type)}
                    className="capitalize text-xs"
                  >
                    {active && <Check className="mr-1.5 h-3.5 w-3.5" />}
                    {type}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 bg-card/20 space-y-3">
            <div className="flex items-center gap-2 font-medium text-sm">
              <Smartphone className="h-4 w-4 text-brand-green-500" />
              <span>When using mobile data</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['photos', 'videos', 'voice', 'documents'].map((type) => {
                const active = autoMobile.includes(type)
                return (
                  <Button
                    key={type}
                    size="sm"
                    variant={active ? 'gradient' : 'outline'}
                    onClick={() => toggleMobilePreference(type)}
                    className="capitalize text-xs"
                  >
                    {active && <Check className="mr-1.5 h-3.5 w-3.5" />}
                    {type}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* 4. Admin-Visible Headroom Monitoring */}
      <SettingsSection title="KuikChat Server Headroom">
        <div className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-purple-400 animate-pulse" />
            <div>
              <p className="font-semibold text-sm">Physical Host Storage Pool</p>
              <p className="text-xs text-muted-foreground">
                Monitoring physical disk status on 217.154.11.234
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Total Provisioned:</span>
              <p className="font-bold text-foreground">{formatSize(data.headroom.totalProvisioned)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Total Physical Used:</span>
              <p className="font-bold text-foreground">{formatSize(data.headroom.totalUsed)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <Progress
              value={(data.headroom.totalUsed / data.headroom.physicalDiskPool) * 100}
              className="h-2 bg-background"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{formatSize(data.headroom.totalUsed)} used</span>
              <span>{formatSize(data.headroom.physicalDiskPool)} host pool capacity</span>
            </div>
          </div>

          <div className="rounded-lg bg-purple-500/5 border border-purple-500/10 p-3 text-[11px] text-purple-300">
            <strong>Oversubscription Assumption:</strong> 11.25x ratio is maintained. 4,500 GB is provisioned against the physical 480 GB SSD pool. Alerts will trigger automatically at 80% physical utilization ({formatSize(data.headroom.physicalDiskPool * 0.8)}).
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
