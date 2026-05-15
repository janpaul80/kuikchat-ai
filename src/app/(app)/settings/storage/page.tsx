import { Button } from '@/components/ui/button'
import {
  SettingsContainer,
  SettingsHeader,
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { ImageIcon, Video, FileText, Mic, HardDrive } from 'lucide-react'

const STORAGE_BREAKDOWN = [
  { label: 'Photos', value: 1.2, color: 'bg-brand-blue-500', icon: ImageIcon },
  { label: 'Videos', value: 0.8, color: 'bg-brand-green-500', icon: Video },
  { label: 'Documents', value: 0.3, color: 'bg-brand-teal-500', icon: FileText },
  { label: 'Voice messages', value: 0.15, color: 'bg-purple-500', icon: Mic },
]

export default function StorageSettingsPage() {
  const total = STORAGE_BREAKDOWN.reduce((s, x) => s + x.value, 0)

  return (
    <SettingsContainer>
      <SettingsHeader title="Storage" description="Manage what's taking up space" />

      <SettingsSection title="Storage usage">
        <div className="rounded-xl bg-secondary p-4">
          <div className="flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-brand-blue-500" />
            <div>
              <p className="text-2xl font-bold">{total.toFixed(2)} GB</p>
              <p className="text-xs text-muted-foreground">used out of 5 GB on KuikCloud</p>
            </div>
          </div>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-background">
            {STORAGE_BREAKDOWN.map((s) => (
              <div
                key={s.label}
                className={s.color}
                style={{ width: `${(s.value / 5) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STORAGE_BREAKDOWN.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${s.color}`} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.value} GB</p>
              </div>
            )
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="Cleanup">
        <SettingsRow label="Large files" description="Files larger than 50 MB">
          <Button variant="outline" size="sm">Review</Button>
        </SettingsRow>
        <SettingsRow label="Forwarded media" description="Media you didn't send originally">
          <Button variant="outline" size="sm">Review</Button>
        </SettingsRow>
        <SettingsRow label="Old chats" description="Inactive for 6+ months">
          <Button variant="outline" size="sm">Review</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Auto-download">
        <SettingsRow label="On WiFi" description="Photos, voice, videos">
          <Button variant="outline" size="sm">Configure</Button>
        </SettingsRow>
        <SettingsRow label="On mobile data" description="Photos only">
          <Button variant="outline" size="sm">Configure</Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Backup">
        <SettingsRow label="KuikCloud backup" description="Encrypted, auto every 24h">
          <Button variant="outline" size="sm">On</Button>
        </SettingsRow>
        <SettingsRow label="Export chat history" description="Download as PDF or TXT">
          <Button variant="outline" size="sm">Export</Button>
        </SettingsRow>
      </SettingsSection>
    </SettingsContainer>
  )
}
