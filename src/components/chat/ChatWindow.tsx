'use client'

import { isVirtualChatId, HERMES_CHAT_ID } from '@/lib/chat/types'
import { HermesChatWindow } from './HermesChatWindow'
import { RealChatWindow } from './RealChatWindow'

interface ChatWindowProps {
  chatId: string
}

/**
 * Top-level switcher: Hermes virtual chat keeps its existing OpenAI behavior,
 * everything else uses real Supabase persistence + realtime.
 */
export function ChatWindow({ chatId }: ChatWindowProps) {
  if (isVirtualChatId(chatId) || chatId === HERMES_CHAT_ID) {
    return <HermesChatWindow />
  }
  return <RealChatWindow chatId={chatId} />
}
