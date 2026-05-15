'use client'

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
            😀
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quick reactions</p>
            <div className="flex flex-wrap gap-1">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="rounded-md px-2 py-1 text-lg hover:bg-accent"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">All reactions</p>
            <div className="grid grid-cols-8 gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="rounded-md px-2 py-1 text-lg hover:bg-accent"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
