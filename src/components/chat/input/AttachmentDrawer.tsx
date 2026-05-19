'use client'

import React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image as ImageIcon, 
  Camera, 
  FileBox, 
  MapPin, 
  BarChart2, 
  Sparkles,
  Plus,
  UserCircle,
  CalendarCheck,
  ShieldCheck,
  Captions,
  FileSearch
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerItem {
  id: string
  label: string
  icon: React.FC<any>
  colorClass: string
  bgClass: string
  onClick: () => void
  disabled?: boolean
  title?: string
}

interface AttachmentDrawerProps {
  onSelectMedia: () => void
  onSelectDocument: () => void
  onSelectAI: () => void
  onSelectPoll: () => void
  onSelectContact: () => void
  onSelectLocation: () => void
  onSelectEvent: () => void
}

export function AttachmentDrawer({ onSelectMedia, onSelectDocument, onSelectAI, onSelectPoll, onSelectContact, onSelectLocation, onSelectEvent }: AttachmentDrawerProps) {
  const [open, setOpen] = React.useState(false)

  const items: DrawerItem[] = [
    {
      id: 'photos',
      label: 'Photos & Videos',
      icon: ImageIcon,
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-500/10',
      onClick: onSelectMedia
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      colorClass: 'text-rose-500',
      bgClass: 'bg-rose-500/10',
      onClick: () => { /* Native bridge later */ }
    },
    {
      id: 'document',
      label: 'Document',
      icon: FileBox,
      colorClass: 'text-indigo-500',
      bgClass: 'bg-indigo-500/10',
      onClick: onSelectDocument // FileNinja Gateway
    },
    {
      id: 'fileninja',
      label: 'Secure File',
      icon: ShieldCheck,
      colorClass: 'text-cyan-500',
      bgClass: 'bg-cyan-500/10',
      onClick: () => {},
      disabled: true,
      title: 'FileNinja secure transfer is unavailable until provider configuration and upload sessions are implemented.'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: UserCircle,
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
      onClick: onSelectContact
    },
    {
      id: 'location',
      label: 'Location',
      icon: MapPin,
      colorClass: 'text-rose-500',
      bgClass: 'bg-rose-500/10',
      onClick: onSelectLocation
    },
    {
      id: 'poll',
      label: 'Poll',
      icon: BarChart2,
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
      onClick: onSelectPoll
    },
    {
      id: 'event',
      label: 'Event',
      icon: CalendarCheck,
      colorClass: 'text-orange-500',
      bgClass: 'bg-orange-500/10',
      onClick: onSelectEvent
    },
    {
      id: 'ai',
      label: 'AI Actions',
      icon: Sparkles,
      colorClass: 'text-purple-500',
      bgClass: 'bg-purple-500/10',
      onClick: onSelectAI // Hermes / Rev-Pro Gateway
    },
    {
      id: 'revpro-transcribe',
      label: 'Transcribe',
      icon: Captions,
      colorClass: 'text-fuchsia-500',
      bgClass: 'bg-fuchsia-500/10',
      onClick: () => {},
      disabled: true,
      title: 'Rev-Pro transcription is unavailable until provider configuration and media jobs are implemented.'
    },
    {
      id: 'revpro-summary',
      label: 'Summarize',
      icon: FileSearch,
      colorClass: 'text-violet-500',
      bgClass: 'bg-violet-500/10',
      onClick: () => {},
      disabled: true,
      title: 'Rev-Pro media summaries are unavailable until provider configuration and media jobs are implemented.'
    }
  ]

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
            open ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <Plus className={cn("h-5 w-5 transition-transform duration-200", open && "rotate-45")} />
        </button>
      </Popover.Trigger>

      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              side="top"
              align="start"
              sideOffset={12}
              className="z-50 w-72 md:w-80 outline-none"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden rounded-2xl border border-border/50 bg-card/95 p-3 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-card/80"
              >
                <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={item.disabled}
                      title={item.title}
                      aria-disabled={item.disabled}
                      onClick={() => {
                        if (item.disabled) return
                        item.onClick()
                        setOpen(false)
                      }}
                      className={cn(
                        "group flex flex-col items-center gap-1.5 outline-none",
                        item.disabled && "cursor-not-allowed opacity-45"
                      )}
                    >
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 group-active:scale-95",
                        item.disabled && "group-hover:scale-100 group-active:scale-100",
                        item.bgClass
                      )}>
                        <item.icon className={cn("h-6 w-6", item.colorClass)} strokeWidth={2} />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground line-clamp-1 text-center px-1">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  )
}
