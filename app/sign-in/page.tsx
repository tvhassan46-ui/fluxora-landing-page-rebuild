import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Sign in | LIVA' }

export default async function SignInPage() {
  const session = process.env.DATABASE_URL
    ? await auth.api.getSession({ headers: await headers() })
    : null
  if (session?.user) redirect('/dashboard')
  return <AuthForm mode="sign-in" />
}
