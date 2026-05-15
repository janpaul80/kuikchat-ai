'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Lock,
  Shield,
  Bell,
  Palette,
  CreditCard,
  HardDrive,
  HelpCircle,
  Info,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const SETTINGS_NAV = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/privacy', label: 'Privacy', icon: Lock },
  { href: '/settings/security', label: 'Security', icon: Shield },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
  { href: '/settings/storage', label: 'Storage', icon: HardDrive },
  { href: '/settings/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings/help', label: 'Help', icon: HelpCircle },
  { href: '/settings/about', label: 'About', icon: Info },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSubpage = pathname !== '/settings'

  return (
    <div className="flex h-full">
      {/* Settings nav (always visible on desktop) */}
      <aside
        className={cn(
          'h-full w-full border-r border-border bg-card md:max-w-xs',
          isSubpage && 'hidden md:flex md:flex-col'
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Settings content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto bg-background scrollbar-thin',
          !isSubpage && 'hidden md:block'
        )}
      >
        {isSubpage && (
          <div className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h2 className="font-semibold">
              {SETTINGS_NAV.find((i) => i.href === pathname)?.label || 'Settings'}
            </h2>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
