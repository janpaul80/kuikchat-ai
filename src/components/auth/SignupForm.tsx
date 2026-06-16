'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Mail, User, AtSign, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { generateUsername } from '@/lib/utils'

export function SignupForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const finalUsername = username.trim() || generateUsername(email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username: finalUsername,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If Supabase returned a session, the user is already logged in
    // (happens when "Confirm email" is OFF in Supabase Auth settings).
    // In that case, skip the "check your email" screen and go straight to /chats.
    if (data?.session) {
      router.replace('/chats')
      router.refresh()
      return
    }

    // No session → email confirmation is required. Show the verification screen.
    setSuccess(true)
    setLoading(false)
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="p-8 text-center shadow-2xl bg-[#0d0f14]/90 border border-white/10 backdrop-blur-xl text-white">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-500/10 border border-brand-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <CheckCircle2 className="h-8 w-8 text-brand-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Check your email</h1>
        <p className="mt-2.5 text-sm text-white/50 leading-relaxed">
          We sent a verification link to <strong className="text-white">{email}</strong>. Click it to activate
          your KuikChat account.
        </p>
        <Button variant="outline" className="mt-8 w-full bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => router.push('/login')}>
          Back to login
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-8 shadow-2xl bg-[#0d0f14]/90 border border-white/10 backdrop-blur-xl text-white">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-white/50">
          No phone number required. Just email.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          onClick={() => handleOAuth('google')}
          disabled={loading}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          onClick={() => handleOAuth('apple')}
          disabled={loading}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continue with Apple
        </Button>
      </div>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase font-semibold tracking-wider text-white/30">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-white/70 ml-1">Display name</Label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within:text-[hsl(217,91%,60%)] transition-colors" />
            <Input
              id="displayName"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%,0.2)] transition-all h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-white/70 ml-1">Username</Label>
          <div className="relative group">
            <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within:text-[hsl(217,91%,60%)] transition-colors" />
            <Input
              id="username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%,0.2)] transition-all h-12"
              minLength={3}
              maxLength={20}
            />
          </div>
          <p className="text-[10px] text-white/30 ml-1">
            Unique @handle. Letters, numbers, underscores only.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/70 ml-1">Email</Label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within:text-[hsl(217,91%,60%)] transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%,0.2)] transition-all h-12"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" id="password-label" className="text-white/70 ml-1">Password</Label>
          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%,0.2)] transition-all h-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm text-destructive animate-fade-in">
            {error}
          </div>
        )}

        <Button type="submit" variant="gradient" className="w-full h-12 font-bold shadow-xl shadow-brand-blue-500/20 mt-2" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create account
        </Button>

        <p className="text-center text-[10px] text-white/30 px-4">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link>
          {' and '}
          <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[hsl(217,91%,60%)] hover:text-[hsl(217,91%,70%)] transition-colors hover:underline underline-offset-4">
          Log in
        </Link>
      </p>
    </Card>
  )
}
