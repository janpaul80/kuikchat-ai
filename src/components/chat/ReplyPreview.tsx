'use client'

import { X } from 'lucide-react'

interface ReplyPreviewProps {
  label?: string
  body?: string | null
  onClear?: () => void
  className?: string
}

export function ReplyPreview({ label = 'Replying to', body, onClear, className }: ReplyPreviewProps) {
  return (
    <div className={['rounded-md border bg-muted/40 px-3 py-2', className].filter(Boolean).join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-primary">{label}</p>
          <p className="truncate text-sm text-muted-foreground">{body || 'Message unavailable'}</p>
        </div>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
