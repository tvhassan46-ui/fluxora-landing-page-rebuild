import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardActions } from '@/components/dashboard-actions'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Your workspace | Fluxora' }

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="auth-page dashboard-page">
      <Link className="auth-brand" href="/" aria-label="Fluxora home"><span className="auth-brand-mark" aria-hidden="true">✳</span>Fluxora</Link>
      <section className="dashboard-card" aria-labelledby="dashboard-title">
        <p className="auth-eyebrow">Your Fluxora account</p>
        <h1 id="dashboard-title">Welcome, {session.user.name}</h1>
        <p className="auth-intro">You&apos;re signed in as <strong>{session.user.email}</strong>. Your workspace is ready.</p>
        <div className="dashboard-actions"><Link className="auth-submit dashboard-explore" href="/#products">Explore our products <span aria-hidden="true">↗</span></Link><DashboardActions /></div>
      </section>
      <p className="auth-footer">Thoughtful technology, made for people.</p>
    </main>
  )
}
