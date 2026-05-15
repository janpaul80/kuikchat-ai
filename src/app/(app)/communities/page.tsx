import { Users } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/PagePlaceholder'

export default function CommunitiesPage() {
  return (
    <PagePlaceholder
      icon={Users}
      title="Communities"
      description="Real community infrastructure — beyond ordinary group chats"
      features={[
        'Communities with unlimited members across sub-groups',
        'Groups up to 1,024 members each',
        'Topics: sub-channels within a group (Discord-style)',
        'Custom roles: Owner / Admin / Moderator / Member / Guest',
        'Role badges (e.g. 🎨 Designer, 👨‍💻 Dev, 📢 Announcer)',
        'Slow mode and announcement-only mode',
        'Polls, events with RSVP, scheduled messages',
        'Banned-words auto-moderation',
        'Public community discovery',
      ]}
    />
  )
}
