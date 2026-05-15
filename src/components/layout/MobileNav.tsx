'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Phone, Radio, Sparkles, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/chats', label: 'Chats', icon: MessageSquare },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/status', label: 'Status', icon: Radio },
  { href: '/hermes', label: 'Hermes', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                active ? 'text-brand-blue-500' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-brand-blue-500')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
