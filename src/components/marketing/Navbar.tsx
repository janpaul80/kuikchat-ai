'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/security', label: 'Security' },
  { href: '/download', label: 'Download' },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isDarkPage = isHome || ['/about', '/pricing', '/download'].includes(pathname ?? '')

  return (
    <header
      className={cn(
        'top-0 z-50 w-full transition-colors',
        isHome
          ? 'absolute border-b border-white/10 bg-transparent text-white'
          : isDarkPage
            ? 'sticky border-b border-white/10 bg-[#02070d]/90 text-white backdrop-blur-xl'
            : 'sticky border-b border-border/40 bg-background/80 backdrop-blur-xl'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo
          size={isHome ? 82 : 36}
          showText={!isHome}
          textClassName={isHome ? 'text-white' : undefined}
        />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-bold transition-colors',
                isDarkPage
                  ? 'text-white/85 hover:text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            className={isDarkPage ? 'text-white hover:bg-white/10 hover:text-white' : undefined}
            asChild
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            variant={isHome ? 'secondary' : 'gradient'}
            className={isHome ? 'rounded-full bg-white text-slate-950 hover:bg-white/90' : undefined}
            asChild
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <button
          className={cn(
            'rounded-xl p-2 md:hidden',
            isHome ? 'bg-white/10 text-white backdrop-blur' : undefined
          )}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-t md:hidden',
          isHome
            ? 'border-white/10 bg-slate-950/90 text-white backdrop-blur-xl'
            : isDarkPage
              ? 'border-white/10 bg-[#02070d] text-white'
            : 'border-border/40 bg-background',
          open ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            <Button variant="ghost" asChild className="w-full">
              <Link href="/login">Log in</Link>
            </Button>
            <Button variant="gradient" asChild className="w-full">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
