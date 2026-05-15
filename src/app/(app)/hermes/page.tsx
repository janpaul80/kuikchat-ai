import { ChatWindow } from '@/components/chat/ChatWindow'

export default function HermesPage() {
  return (
    <div className="flex h-full">
      <ChatWindow chatId="hermes" />
    </div>
  )
}
