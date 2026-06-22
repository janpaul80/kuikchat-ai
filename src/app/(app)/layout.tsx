import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { selfHealProfile } from '@/lib/supabase/selfHeal'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fallback: check and self-heal profile if missing in public.profiles
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      const serviceClient = createServiceRoleClient()
      await selfHealProfile(
        serviceClient,
        user.id,
        user.email,
        user.user_metadata
      )
    }
  } catch (err) {
    console.error('Self-healing error in AppLayout:', err)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  )
}

