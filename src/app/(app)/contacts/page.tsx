import { CircleUserRound } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/PagePlaceholder'

export default function ContactsPage() {
  return (
    <PagePlaceholder
      icon={CircleUserRound}
      title="Contacts"
      description="Find friends by username, email, or QR code — no phone number needed"
      features={[
        'Add by @username (Telegram-style)',
        'Personal QR code — share to add instantly',
        'Email-based contact discovery',
        'Sync optional address book matching',
        'Custom labels and groups',
        'Block list management',
        'Close Friends list for selective sharing',
        'Verified professional contacts',
      ]}
    />
  )
}
