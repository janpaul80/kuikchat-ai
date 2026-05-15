import { Briefcase } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/PagePlaceholder'

export default function ProfessionalPage() {
  return (
    <PagePlaceholder
      icon={Briefcase}
      title="Professional Mode"
      description="LinkedIn meets Slack meets WhatsApp — built for business"
      features={[
        'Verified business profile with logo, hours, website',
        'Quick reply templates for fast responses',
        'Product & service catalog in your profile',
        'Broadcast lists — one message to many contacts',
        'Auto-reply: away messages and greetings',
        'Label system: Lead, Customer, VIP, Pending',
        'Built-in analytics: open rates, response times',
        'Appointment booking inside chat',
        'Invoice generation and sharing',
        'Team inbox: multiple agents on one account',
        'CRM integrations (HubSpot, Salesforce)',
      ]}
    />
  )
}
