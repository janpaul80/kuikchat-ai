import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected app routes
  const isAppRoute =
    pathname.startsWith('/chats') ||
    pathname.startsWith('/calls') ||
    pathname.startsWith('/status') ||
    pathname.startsWith('/channels') ||
    pathname.startsWith('/communities') ||
    pathname.startsWith('/hermes') ||
    pathname.startsWith('/contacts') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/professional') ||
    pathname.startsWith('/add')

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/verify') ||
    pathname.startsWith('/forgot-password')

  if (!user && isAppRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/chats'
    return NextResponse.redirect(url)
  }

  // Logged-in users visiting the marketing landing page go straight to the app
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/chats'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
