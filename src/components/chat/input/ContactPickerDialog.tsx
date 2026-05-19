'use client'

import React, { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Search, User, Star, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { fetchContacts } from '@/lib/chat/queries'
import type { ProfileLite } from '@/lib/chat/types'

interface ContactWithMeta extends ProfileLite {
  nickname: string | null
  is_favorite: boolean
}

interface ContactPickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (contact: ProfileLite) => void
  currentUserId: string
}

export function ContactPickerDialog({ open, onClose, onSelect, currentUserId }: ContactPickerDialogProps) {
  const [contacts, setContacts] = useState<ContactWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!open) return
    async function load() {
      try {
        const data = await fetchContacts(supabase, currentUserId)
        setContacts(data)
      } catch (e) {
        console.error('Failed to load contacts', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, supabase, currentUserId])

  const filtered = contacts.filter((c) => {
    const name = (c.display_name || c.nickname || c.username || '').toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const handleSelect = (contact: ContactWithMeta) => {
    onSelect({
      id: contact.id,
      username: contact.username,
      display_name: contact.display_name,
      avatar_url: contact.avatar_url
    })
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-4 md:p-0 animate-in zoom-in-95 duration-200">
          <div className="flex max-h-[80vh] flex-col overflow-hidden rounded-3xl bg-background shadow-2xl border border-border">
            
            <div className="flex items-center justify-between border-b px-6 py-4">
              <Dialog.Title className="text-lg font-semibold tracking-tight">Share Contact</Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-4 border-b bg-accent/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              {loading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-accent" />
                      <div className="h-4 w-24 rounded bg-accent" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {search ? 'No contacts found' : 'Your contact list is empty'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelect(contact)}
                      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-accent/50 group"
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border/50 bg-accent">
                        {contact.avatar_url ? (
                          <img src={contact.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <User className="h-6 w-6" />
                          </div>
                        )}
                        {contact.is_favorite && (
                          <div className="absolute bottom-0 right-0 rounded-full bg-background p-0.5 shadow-sm">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[15px] font-semibold text-foreground group-hover:text-brand-blue-600 transition-colors">
                          {contact.display_name || contact.nickname || contact.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{contact.username || 'user'}
                        </p>
                      </div>
                      <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center group-hover:border-brand-blue-500 group-hover:bg-brand-blue-500/10 transition-all">
                        <Check className="h-3 w-3 text-transparent group-hover:text-brand-blue-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t bg-accent/20 px-6 py-4 text-center">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                Business & Professional Networking
              </p>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
