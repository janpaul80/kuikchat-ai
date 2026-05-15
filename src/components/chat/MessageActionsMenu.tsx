'use client'

interface Props {
  messageId: string
  onEdit: () => void
  onDelete: () => void
  onReply: () => void
}

export function MessageActionsMenu({ messageId, onEdit, onDelete, onReply }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg">
      <button onClick={onEdit} className="p-2 hover:bg-accent rounded text-xs" title="Edit">
        ✏️
      </button>
      <button onClick={onDelete} className="p-2 hover:bg-accent rounded text-xs" title="Delete">
        🗑️
      </button>
      <button onClick={onReply} className="p-2 hover:bg-accent rounded text-xs" title="Reply">
        ↩️
      </button>
    </div>
  )
}
