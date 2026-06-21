import { Megaphone } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/PagePlaceholder'

export default function ChannelsPage() {
  return (
    <PagePlaceholder
      icon={Megaphone}
      title="Channels"
      description="Broadcast to unlimited subscribers - Telegram + Newsletter + Instagram in one"
      features={[
        'Public channels with unlimited subscribers',
        'Private subscription-gated channels',
        'Discover by category, trending, location',
        'Reactions and threaded comments',
        'Channel monetization - keep 80% of revenue',
        'Schedule posts in advance',
        'Detailed analytics: views, reach, reactions',
        'Cross-post to multiple channels',
      ]}
    />
  )
}
