import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'

export default function ChatDetailPage({ params }: { params: { chatId: string } }) {
  return (
    <div className="flex h-full">
      {/* Hide chat list on mobile when a chat is open */}
      <div className="hidden md:block">
        <ChatList />
      </div>
      <div className="flex-1">
        <ChatWindow chatId={params.chatId} />
      </div>
    </div>
  )
}
