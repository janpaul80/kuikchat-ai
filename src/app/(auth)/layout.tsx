import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="blob bg-brand-blue-500"
          style={{ width: 600, height: 600, top: '-20%', left: '-10%' }}
        />
        <div
          className="blob bg-brand-green-400"
          style={{
            width: 500,
            height: 500,
            bottom: '-10%',
            right: '-10%',
            animationDelay: '5s',
          }}
        />
      </div>

      <div className="absolute top-6 left-6">
        <Logo size={36} />
      </div>

      <div className="w-full max-w-md">{children}</div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
