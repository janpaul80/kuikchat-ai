import { SiteHeader } from '@/components/landing/SiteHeader'
import { Footer } from '@/components/marketing/Footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  )
}
