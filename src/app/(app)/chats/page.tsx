import { ChatList } from '@/components/chat/ChatList'
import { MessageSquare } from 'lucide-react'

export default function ChatsPage() {
  return (
    <div className="flex h-full">
      <ChatList />
      {/* Empty state on desktop */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-secondary/30 p-8 text-center md:flex">
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient text-white shadow-2xl animate-pulse-glow">
          <MessageSquare className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold">Welcome to KuikChat</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Select a chat from the list to start messaging, or click the{' '}
          <span className="text-brand-blue-500 font-semibold">+</span> button to start a new
          conversation.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <span>🔒 End-to-end encrypted</span>
          <span>•</span>
          <span>✨ Powered by Hermes AI</span>
        </div>
      </div>
    </div>
  )
}
