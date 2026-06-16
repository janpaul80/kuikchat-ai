'use client'

import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { APP_DOMAIN } from '@/lib/constants'

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Download', href: '/download' },
    { label: 'Hermes AI', href: '/features' },
    { label: 'FileNinja transfers', href: '/features' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Support', href: '/support' },
    { label: 'Security', href: '/security' },
  ],
  Resources: [
    { label: 'Launch FAQ', href: '/support' },
    { label: 'Android roadmap', href: '/download' },
    { label: 'Report an issue', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#02070d] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo size={36} />
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              The all-in-one messenger, powered by Hermes AI. Built for personal and
              professional use — with zero phone number requirement.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} KuikChat. All rights reserved. •{' '}
            <span className="text-brand-green-300">{APP_DOMAIN}</span>
          </p>
          <p className="text-xs text-slate-500">
            End-to-end encrypted • Available worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
