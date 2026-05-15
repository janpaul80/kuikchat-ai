'use client'

import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface TypingIndicatorProps {
  typingUsers: string[]
  className?: string
}

export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const label = typingUsers.length === 1
    ? 'typing...'
    : typingUsers.length === 2
      ? 'typing...'
      : `${typingUsers.length} people typing...`

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground',
      className
    )}>
      <div className="flex -space-x-1">
        {typingUsers.slice(0, 3).map((_, i) => (
          <div
            key={i}
            className="h-3 w-3 bg-primary rounded-full ring-2 ring-background"
          />
        ))}
      </div>
      <span>{label}</span>
    </div>
  )
}
