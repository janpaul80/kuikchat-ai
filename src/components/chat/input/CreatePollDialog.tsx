'use client'

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Trash2, Clock, Users, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PollFormData {
  question: string
  options: string[]
  isMultiple: boolean
  isAnonymous: boolean
  closesInHours: number | null
}

interface CreatePollDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: PollFormData) => void
}

export function CreatePollDialog({ open, onClose, onSubmit }: CreatePollDialogProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [isMultiple, setIsMultiple] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [closesInHours, setClosesInHours] = useState<number | null>(null) // null = never

  const handleAddOption = () => {
    if (options.length >= 10) return
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return
    const next = [...options]
    next.splice(index, 1)
    setOptions(next)
  }

  const handleOptionChange = (index: number, val: string) => {
    const next = [...options]
    next[index] = val
    setOptions(next)
  }

  const isValid = question.trim() !== '' && options.filter((o) => o.trim() !== '').length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSubmit({
      question: question.trim(),
      options: options.filter((o) => o.trim() !== '').map((o) => o.trim()),
      isMultiple,
      isAnonymous,
      closesInHours
    })
    // Reset state for next time
    setQuestion('')
    setOptions(['', ''])
    setIsMultiple(false)
    setIsAnonymous(false)
    setClosesInHours(null)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-4 md:p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl bg-background shadow-2xl border border-border">
            
            <div className="flex items-center justify-between border-b px-6 py-4">
              <Dialog.Title className="text-lg font-semibold tracking-tight">Create Poll</Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form id="poll-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Question */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Question</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Ask a question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full rounded-xl border border-border/50 bg-accent/30 px-4 py-3 text-[15px] outline-none transition-colors focus:border-brand-blue-500/50 focus:bg-background focus:ring-1 focus:ring-brand-blue-500/50"
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Options</label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="w-full rounded-xl border border-border/50 bg-accent/30 px-4 py-2.5 text-[15px] outline-none transition-colors focus:border-brand-blue-500/50 focus:bg-background focus:ring-1 focus:ring-brand-blue-500/50"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(i)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {options.length < 10 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex items-center gap-2 text-sm font-medium text-brand-blue-500 transition-colors hover:text-brand-blue-600"
                    >
                      <Plus className="h-4 w-4" />
                      Add Option
                    </button>
                  )}
                </div>

                <div className="h-px bg-border/50" />

                {/* Settings */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">Settings</label>
                  
                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-accent/30 p-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Multiple Answers</span>
                        <span className="text-xs text-muted-foreground">Voters can select more than one option</span>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" checked={isMultiple} onChange={(e) => setIsMultiple(e.target.checked)} />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-zinc-700"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-accent/30 p-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Anonymous Voting</span>
                        <span className="text-xs text-muted-foreground">Hide who voted for what</span>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-zinc-700"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-accent/30 p-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Duration</span>
                        <span className="text-xs text-muted-foreground">When does the poll end?</span>
                      </div>
                    </div>
                    <select
                      value={closesInHours || ''}
                      onChange={(e) => setClosesInHours(e.target.value ? Number(e.target.value) : null)}
                      className="rounded-lg border border-border/50 bg-background px-3 py-1.5 text-sm outline-none"
                    >
                      <option value="">Never</option>
                      <option value="1">1 Hour</option>
                      <option value="24">1 Day</option>
                      <option value="168">1 Week</option>
                    </select>
                  </div>

                </div>

              </form>
            </div>

            <div className="border-t bg-accent/20 px-6 py-4">
              <button
                type="submit"
                form="poll-form"
                disabled={!isValid}
                className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Poll
              </button>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
