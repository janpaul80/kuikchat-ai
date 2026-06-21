import {
  SettingsContainer,
  SettingsHeader,
} from '@/components/settings/SettingsSection'
import { StorageForm } from '@/components/settings/StorageForm'

export default function StorageSettingsPage() {
  return (
    <SettingsContainer>
      <SettingsHeader title="Storage" description="Manage your server space and downloads" />
      <StorageForm />
    </SettingsContainer>
  )
}
