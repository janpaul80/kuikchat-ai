'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  Phone,
  Radio,
  Users,
  Sparkles,
  CircleUserRound,
  Megaphone,
  Briefcase,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/Logo'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string | number
}

const NAV_ITEMS: NavItem[] = [
  { href: '/chats', label: 'Chats', icon: MessageSquare, badge: 3 },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/status', label: 'Status', icon: Radio },
  { href: '/channels', label: 'Channels', icon: Megaphone },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/hermes', label: 'Hermes AI', icon: Sparkles },
  { href: '/contacts', label: 'Contacts', icon: CircleUserRound },
  { href: '/professional', label: 'Professional', icon: Briefcase },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/chats">
          <Logo size={32} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-brand-gradient text-white shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', active && 'text-white')} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-brand-blue-500 text-white'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Settings (footer) */}
      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
            pathname?.startsWith('/settings')
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  )
}
