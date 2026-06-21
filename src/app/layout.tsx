import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/kuikchat-chat.css'
import { APP_NAME, APP_DESCRIPTION, APP_URL } from '@/lib/constants'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - The All-in-One Messenger + AI Agent Platform`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    'KuikChat',
    'messenger',
    'AI chat',
    'Hermes AI',
    'encrypted messaging',
    'voice calls',
    'video calls',
    'channels',
    'communities',
    'WhatsApp alternative',
    'Telegram alternative',
    'Signal alternative',
  ],
  authors: [{ name: 'KuikChat' }],
  creator: 'KuikChat',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('kc-theme') || 'dark';
                const root = document.documentElement;
                root.classList.remove('dark', 'amoled');
                if (saved === 'dark' || saved === 'amoled' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  root.classList.add('dark');
                  if (saved === 'amoled') root.classList.add('amoled');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
