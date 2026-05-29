'use client'

import { ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileNinjaDeliveryCardProps {
  metadata: Record<string, any> | null | undefined
  mine: boolean
}

function formatBytes(value: unknown) {
  const bytes = typeof value === 'number' && Number.isFinite(value) ? value : 0
  if (bytes <= 0) return 'Unknown size'

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function isReadyFileNinjaMessage(metadata: Record<string, any> | null | undefined) {
  return Boolean(
    metadata?.provider === 'fileninja' &&
      metadata?.status === 'ready' &&
      metadata?.deliveryEnabled === true &&
      typeof metadata?.fileninja?.publicUrl === 'string'
  )
}

export function FileNinjaDeliveryCard({ metadata, mine }: FileNinjaDeliveryCardProps) {
  const file = metadata?.file || {}
  const provider = metadata?.fileninja || {}
  const fileName = typeof file.name === 'string' && file.name.trim() ? file.name : 'Secure file'
  const fileSize = formatBytes(file.size)
  const href = typeof provider.publicUrl === 'string' ? provider.publicUrl : ''

  if (!href) return null

  return (
    <div
      className={cn(
        'w-[250px] max-w-full rounded-xl border p-3 text-left',
        mine
          ? 'border-white/20 bg-white/10 text-white'
          : 'border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            mine ? 'bg-white/15' : 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
          )}
        >
          <FileText className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-5">{fileName}</p>
          <p className={cn('text-[11px]', mine ? 'text-blue-100/80' : 'text-zinc-500')}>
            {fileSize}
          </p>
          <div className={cn('mt-1 flex items-center gap-1 text-[11px]', mine ? 'text-blue-100/90' : 'text-cyan-700 dark:text-cyan-300')}>
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>FileNinja · Ready</span>
          </div>
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'mt-3 flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold transition-colors',
          mine
            ? 'bg-white text-blue-700 hover:bg-blue-50'
            : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200'
        )}
      >
        <ExternalLink className="h-4 w-4" />
        <span>Open / Download</span>
      </a>
    </div>
  )
}
