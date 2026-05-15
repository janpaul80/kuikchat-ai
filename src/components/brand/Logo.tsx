import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  showText?: boolean
  href?: string | null
  className?: string
  textClassName?: string
  variant?: 'default' | 'compact'
}

/**
 * KuikChat Logo Component
 * Uses the official branding logo at /logo.png
 * IMPORTANT: Never replace or regenerate this logo.
 */
export function Logo({
  size = 40,
  showText = true,
  href = '/',
  className,
  textClassName,
  variant = 'default',
}: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="KuikChat"
          fill
          priority
          className="object-contain drop-shadow-sm"
          sizes={`${size}px`}
        />
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight text-brand-gradient',
            variant === 'compact' ? 'text-lg' : 'text-xl',
            textClassName
          )}
        >
          KuikChat
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center transition-opacity hover:opacity-80">
        {content}
      </Link>
    )
  }

  return content
}

/**
 * Animated logo for hero sections — has a glow effect
 */
export function LogoHero({ size = 120 }: { size?: number }) {
  return (
    <div
      className="relative inline-block animate-pulse-glow rounded-3xl"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="KuikChat"
        fill
        priority
        className="object-contain"
        sizes={`${size}px`}
      />
    </div>
  )
}
