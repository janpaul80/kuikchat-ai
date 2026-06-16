import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/brand/Logo'
import GlowBackground from '@/components/ui/GlowBackground'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 bg-black">
      {/* Animated brand background */}
      <GlowBackground />

      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="KuikChat" width={32} height={32} className="rounded-lg shadow-lg shadow-brand-blue-500/20" />
          <span className="text-xl font-bold text-white tracking-tight">KuikChat</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-sm">
        <Link href="/" className="text-white/40 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          Back to home
        </Link>
      </div>
    </div>
  )
}
