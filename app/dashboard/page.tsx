import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardView } from '@/components/dashboard-view'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Your reading shelf | LIVA' }

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return <DashboardView name={session.user.name} email={session.user.email} />
}
