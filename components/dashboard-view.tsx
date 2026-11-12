'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LanguageSwitch } from '@/components/language-switch'
import { useLanguage } from '@/components/language-provider'
import { DashboardActions } from '@/components/dashboard-actions'
import { getAuthCopy } from '@/lib/auth-copy'

export function DashboardView({ name, email }: { name: string; email: string }) {
  const { locale } = useLanguage()
  const copy = getAuthCopy(locale)

  return (
    <main className="auth-page dashboard-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <div className="auth-topbar">
        <Link className="auth-brand" href="/" aria-label={locale === 'ar' ? 'الصفحة الرئيسية لحكاية' : 'Hikaya home'}><Image src="/hikaya-mark.svg" alt="" width={28} height={28} />Hikaya</Link>
        <LanguageSwitch />
      </div>
      <section className="dashboard-card" aria-labelledby="dashboard-title">
        <p className="auth-eyebrow">{copy.dashboardEyebrow}</p>
        <h1 id="dashboard-title">{copy.welcome} {name}</h1>
        <p className="auth-intro">{copy.signedInAs} <strong>{email}</strong>. {copy.shelfReady}</p>
        <div className="dashboard-actions"><Link className="auth-submit dashboard-explore" href="/#products">{copy.explore} <span aria-hidden="true">↗</span></Link><DashboardActions /></div>
      </section>
      <p className="auth-footer">{copy.dashboardFooter}</p>
    </main>
  )
}
