import { Settings } from 'lucide-react'

export default function SettingsHubPage() {
  return (
    <div className="hidden h-full items-center justify-center md:flex">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient text-white shadow-xl">
          <Settings className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-2 text-muted-foreground">
          Select an option from the left to customize your KuikChat experience.
        </p>
      </div>
    </div>
  )
}
