import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create your KuikChat account — no phone number required',
}

export default function SignupPage() {
  return <SignupForm />
}
