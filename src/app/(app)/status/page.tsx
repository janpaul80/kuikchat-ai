import { Radio } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/PagePlaceholder'

export default function StatusPage() {
  return (
    <PagePlaceholder
      icon={Radio}
      title="Status"
      description="Share moments that disappear in 24 hours"
      features={[
        'Photo, video, text, or voice status',
        'Per-status audience control',
        'Reactions & private replies',
        'See who viewed your status',
        'Music status — attach a song snippet',
        'Boomerang looping videos',
        'Close Friends list',
        'Private status archive',
      ]}
    />
  )
}
