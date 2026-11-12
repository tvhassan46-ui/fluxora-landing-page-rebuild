import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardActions } from '@/components/dashboard-actions'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Your reading shelf | Hikaya' }

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="auth-page dashboard-page">
      <Link className="auth-brand" href="/" aria-label="Hikaya home"><span className="auth-brand-mark" aria-hidden="true">✳</span>Hikaya</Link>
      <section className="dashboard-card" aria-labelledby="dashboard-title">
        <p className="auth-eyebrow">Your Hikaya account</p>
        <h1 id="dashboard-title">Welcome, {session.user.name}</h1>
        <p className="auth-intro">You&apos;re signed in as <strong>{session.user.email}</strong>. Your reading shelf is ready.</p>
        <div className="dashboard-actions"><Link className="auth-submit dashboard-explore" href="/#products">Explore the library <span aria-hidden="true">↗</span></Link><DashboardActions /></div>
      </section>
      <p className="auth-footer">A home for books, novels, and literary favorites.</p>
    </main>
  )
}
