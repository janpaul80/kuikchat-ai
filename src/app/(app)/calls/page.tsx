import { Phone } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/PagePlaceholder'

export default function CallsPage() {
  return (
    <PagePlaceholder
      icon={Phone}
      title="Calls"
      description="Crystal clear voice & video calls — up to 42 participants"
      features={[
        '1-on-1 voice & HD video calls (1080p)',
        'Group calls with up to 42 participants',
        'End-to-end encrypted, all the time',
        'AI noise cancellation',
        'Screen sharing & background blur',
        'Call recording with consent',
        'Shareable call links — no install required',
        'Scheduled calls with calendar reminders',
        'Whiteboard and live polls during calls',
      ]}
    />
  )
}
