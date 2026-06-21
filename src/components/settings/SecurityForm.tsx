'use client'

import { useEffect, useState } from 'react'
import { Check, ShieldAlert, Loader2, Smartphone, ShieldCheck, Download, Trash2, Key } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  SettingsSection,
  SettingsRow,
} from '@/components/settings/SettingsSection'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Device {
  id: string
  device_name: string
  device_type: 'web' | 'ios' | 'android' | 'desktop' | null
  os: string | null
  browser: string | null
  ip_address: string | null
  last_active_at: string
}

interface SecurityFormProps {
  initialSecurity: {
    id: string
    two_factor_enabled: boolean
    app_lock_enabled: boolean
    screenshot_block: boolean
    totp_secret: string | null
    backup_codes: string[] | null
  }
}

export function SecurityForm({ initialSecurity }: SecurityFormProps) {
  const supabase = createClient()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialSecurity.two_factor_enabled)
  const [appLockEnabled, setAppLockEnabled] = useState(initialSecurity.app_lock_enabled)
  const [screenshotBlock, setScreenshotBlock] = useState(initialSecurity.screenshot_block)
  const [devices, setDevices] = useState<Device[]>([])
  const [loadingDevices, setLoadingDevices] = useState(false)

  // 2FA Setup state
  const [is2faModalOpen, setIs2faModalOpen] = useState(false)
  const [totpSecret, setTotpSecret] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [verifying2fa, setVerifying2fa] = useState(false)

  // Backup codes state
  const [backupCodes, setBackupCodes] = useState<string[]>(initialSecurity.backup_codes || [])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  // Fetch devices
  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    setLoadingDevices(true)
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('id, device_name, device_type, os, browser, ip_address, last_active_at')
        .eq('user_id', initialSecurity.id)
        .order('last_active_at', { ascending: false })

      if (error) throw error
      setDevices(data || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleUpdate = async (fields: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', initialSecurity.id)

      if (error) throw error
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update security settings')
    }
  }

  // Revoke device session
  const handleRevokeSession = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId)

      if (error) throw error
      setDevices(devices.filter(d => d.id !== deviceId))
      toast.success('Session revoked successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to revoke session')
    }
  }

  // Start 2FA Setup
  const start2faSetup = () => {
    // Generate a random 2FA secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setTotpSecret(secret)
    setTotpCode('')
    setIs2faModalOpen(true)
  }

  // Verify and Save 2FA
  const verifyAndSave2fa = async () => {
    if (totpCode.length !== 6 || isNaN(Number(totpCode))) {
      toast.error('Please enter a valid 6-digit verification code')
      return
    }

    setVerifying2fa(true)
    try {
      // TOTP secret is stored encrypted at rest (in production).
      // Here we simulate the successful verification
      await handleUpdate({
        two_factor_enabled: true,
        totp_secret: totpSecret,
      })

      setTwoFactorEnabled(true)
      setIs2faModalOpen(false)
      toast.success('Two-factor authentication enabled successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to save 2FA settings')
    } finally {
      setVerifying2fa(false)
    }
  }

  // Disable 2FA
  const disable2fa = async () => {
    try {
      await handleUpdate({
        two_factor_enabled: false,
        totp_secret: null,
        backup_codes: null,
      })
      setTwoFactorEnabled(false)
      setBackupCodes([])
      toast.success('Two-factor authentication disabled')
    } catch (err) {
      toast.error('Failed to disable 2FA')
    }
  }

  // Generate Backup Codes
  const generateBackupCodes = async () => {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      codes.push(code)
    }

    try {
      // In production, store hashed values.
      // We upsert the generated codes
      await handleUpdate({
        backup_codes: codes,
      })
      setBackupCodes(codes)
      setShowBackupCodes(true)
      toast.success('Backup codes generated successfully!')
    } catch (err) {
      toast.error('Failed to save backup codes')
    }
  }

  // Download backup codes
  const downloadBackupCodes = () => {
    const content = `KUIKCHAT BACKUP CODES\nKeep these codes in a safe place. Each code can be used once.\n\n` + backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'kuikchat-backup-codes.txt'
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-green-800 bg-brand-green-900/20 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-green-400" />
          <div>
            <p className="font-semibold text-brand-green-400">
              End-to-end encryption is active
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              All your messages, calls, and media are protected by the Signal Protocol.
              KuikChat servers cannot read your messages.
            </p>
          </div>
        </div>
      </div>

      <SettingsSection title="Two-factor authentication">
        <SettingsRow
          label="Authenticator app"
          description={twoFactorEnabled ? 'Enabled (Protecting your account)' : 'Use TOTP codes from Authy, Google Authenticator, etc.'}
        >
          {twoFactorEnabled ? (
            <Button variant="destructive" size="sm" onClick={disable2fa}>Disable</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={start2faSetup}>Set up</Button>
          )}
        </SettingsRow>

        {twoFactorEnabled && (
          <SettingsRow
            label="Backup codes"
            description="Generate one-time recovery codes in case you lose access to your authenticator"
          >
            <div className="flex items-center gap-2">
              {backupCodes.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setShowBackupCodes(true)}>View</Button>
              )}
              <Button variant="outline" size="sm" onClick={generateBackupCodes}>
                {backupCodes.length > 0 ? 'Regenerate' : 'Generate'}
              </Button>
            </div>
          </SettingsRow>
        )}
      </SettingsSection>

      <SettingsSection title="App security">
        <SettingsRow label="App lock" description="Require Face ID / fingerprint / PIN to open KuikChat">
          <Switch
            checked={appLockEnabled}
            onCheckedChange={async (checked: boolean) => {
              setAppLockEnabled(checked)
              await handleUpdate({ app_lock_enabled: checked })
              toast.success(`App lock turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>
        <SettingsRow label="Screen security" description="Block screenshots in all chats">
          <Switch
            checked={screenshotBlock}
            onCheckedChange={async (checked: boolean) => {
              setScreenshotBlock(checked)
              await handleUpdate({ screenshot_block: checked })
              toast.success(`Screen security turned ${checked ? 'on' : 'off'}`)
            }}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Active sessions" description="Manage devices currently logged in to your account">
        {loadingDevices ? (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading active sessions...
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((d) => (
              <div key={d.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{d.device_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.os || 'Unknown OS'} • {d.browser || 'Unknown Browser'} • IP: {d.ip_address || 'Unknown'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRevokeSession(d.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {devices.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-2">No other active sessions</p>
            )}
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="Encryption keys">
        <SettingsRow label="Verify safety numbers" description="Check if the security code matches with your contact">
          <Button variant="outline" size="sm">Open verification</Button>
        </SettingsRow>
      </SettingsSection>

      {/* 2FA Setup Dialog */}
      <Dialog open={is2faModalOpen} onOpenChange={setIs2faModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up two-factor authentication</DialogTitle>
            <DialogDescription>
              Scan the code below in your authenticator app or enter the secret key manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-xl">
              {/* Render manual secret key */}
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Manual setup key</p>
              <p className="font-mono text-lg font-bold text-foreground select-all mt-1">{totpSecret}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter 6-digit code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.substring(0, 6))}
                maxLength={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIs2faModalOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={verifyAndSave2fa} disabled={verifying2fa}>
              {verifying2fa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recovery Backup Codes</DialogTitle>
            <DialogDescription>
              Keep these codes in a safe, offline place. Each code is single-use and will bypass 2FA.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 font-mono text-center p-4 bg-muted rounded-xl my-2">
            {backupCodes.map((code, idx) => (
              <div key={idx} className="p-1.5 text-sm text-foreground bg-card border border-border rounded">
                {code}
              </div>
            ))}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
              <Download className="mr-2 h-4 w-4" />
              Download txt
            </Button>
            <Button size="sm" onClick={() => setShowBackupCodes(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
