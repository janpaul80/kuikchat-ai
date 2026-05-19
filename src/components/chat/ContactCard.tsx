'use client'

import React from 'react'
import { User, MessageCircle, Phone, UserPlus, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProfileLite } from '@/lib/chat/types'

interface ContactCardProps {
  contact: ProfileLite
  mine: boolean
}

export function ContactCard({ contact, mine }: ContactCardProps) {
  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-2xl p-4 min-w-[260px] max-w-[300px] border shadow-sm transition-all hover:shadow-md",
      mine 
        ? "bg-white/10 border-white/20 text-white" 
        : "bg-background border-border text-foreground"
    )}>
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          {contact.avatar_url ? (
            <img src={contact.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <User className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <p className="truncate text-base font-bold leading-tight">
            {contact.display_name || contact.username}
          </p>
          <p className={cn(
            "truncate text-xs font-medium",
            mine ? "text-white/60" : "text-muted-foreground"
          )}>
            @{contact.username}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className={cn(
          "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all active:scale-95",
          mine 
            ? "bg-white/10 hover:bg-white/20 text-white" 
            : "bg-accent/50 hover:bg-accent text-foreground"
        )}>
          <MessageCircle className="h-3.5 w-3.5" />
          Message
        </button>
        <button className={cn(
          "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all active:scale-95",
          mine 
            ? "bg-white/10 hover:bg-white/20 text-white" 
            : "bg-accent/50 hover:bg-accent text-foreground"
        )}>
          <UserPlus className="h-3.5 w-3.5" />
          Connect
        </button>
      </div>

      <button className={cn(
        "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold border transition-all active:scale-95",
        mine
          ? "border-white/10 hover:bg-white/5 text-white/80"
          : "border-border hover:bg-accent/30 text-muted-foreground"
      )}>
        <ExternalLink className="h-3.5 w-3.5" />
        View Profile
      </button>
    </div>
  )
}
