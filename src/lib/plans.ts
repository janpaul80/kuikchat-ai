import { Sparkles, Zap, Building2, type LucideIcon } from 'lucide-react'

export interface PlanTier {
  id: string
  name: string
  price: string
  period: string
  icon: LucideIcon
  description: string
  perks: string[]
  cta: string
  href: string
  highlight: boolean
}

export const TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    icon: Sparkles,
    description: 'Start with secure private messaging.',
    perks: ['All core messaging', 'Hermes basic (10 queries/day)', 'Up to 1,024 group members'],
    cta: 'Get started',
    href: '/signup',
    highlight: false,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '$4.99',
    period: '/ month',
    icon: Zap,
    description: 'For professionals, creators, and daily workflows.',
    perks: ['50 GB file storage', 'Verified Blue Badge', 'Hermes Expanded (200 queries/day)', 'Premium themes'],
    cta: 'Subscribe',
    href: '/signup',
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$19',
    period: '/ month',
    icon: Building2,
    description: 'For teams that need shared communication workflows.',
    perks: ['200 GB file storage', 'Verified Blue Badge', 'Hermes Unlimited', 'Team seats & inbox', 'Priority support'],
    cta: 'Subscribe',
    href: '/signup',
    highlight: false,
  },
]
