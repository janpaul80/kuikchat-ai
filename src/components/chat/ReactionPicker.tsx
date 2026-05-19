'use client'

import { SmilePlus, Plus } from 'lucide-react'
import { REACTION_EMOJIS, QUICK_REACTIONS } from '@/lib/chat/emoji'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
  trigger?: React.ReactNode
  className?: string
}

export function ReactionPicker({ onSelect, trigger, className }: ReactionPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm" variant="ghost" className={className}>
            <SmilePlus className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-fit p-1.5" align="start" side="top" sideOffset={8}>
        <div className="flex items-center gap-1">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <div className="mx-1 h-6 w-[1px] bg-border" />
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="More reactions"
              >
                <Plus className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" side="right" align="start">
              <div className="grid grid-cols-6 gap-1">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onSelect(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent"
                    aria-label={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  )
}
