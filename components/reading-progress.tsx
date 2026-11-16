'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Check, Crown, Flame, Medal, Sparkles } from 'lucide-react'
import { LanguageSwitch } from '@/components/language-switch'
import { useLanguage } from '@/components/language-provider'

type ProgressEntry = {
  id: string
  title: string
  detail: string
  completedAt: string
}

const STORAGE_KEY = 'liva-reading-progress-v1'

function readProgress(): ProgressEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter((item): item is ProgressEntry =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.detail === 'string' &&
      typeof item.completedAt === 'string',
    )
  } catch {
    return []
  }
}

export function ChapterCompletionControl({ id, title, detail }: { id: string; title: string; detail: string }) {
  const { locale } = useLanguage()
  const [completed, setCompleted] = useState(false)
  const isArabic = locale === 'ar'

  useEffect(() => {
    const refresh = () => setCompleted(readProgress().some((entry) => entry.id === id))
    refresh()
    window.addEventListener('liva-progress-updated', refresh)
    return () => window.removeEventListener('liva-progress-updated', refresh)
  }, [id])

  function toggle() {
    const current = readProgress()
    const next = completed
      ? current.filter((entry) => entry.id !== id)
      : [{ id, title, detail, completedAt: new Date().toISOString() }, ...current]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 300)))
    setCompleted(!completed)
    window.dispatchEvent(new Event('liva-progress-updated'))
  }

  return (
    <button type="button" className={`chapter-complete-button${completed ? ' is-complete' : ''}`} onClick={toggle} aria-pressed={completed}>
      {completed ? <Check aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
      {completed ? (isArabic ? 'تم إكمال الفصل' : 'Chapter completed') : (isArabic ? 'علّم الفصل كمكتمل' : 'Mark chapter as read')}
    </button>
  )
}

export function ReadingProgressDashboard() {
  const { locale } = useLanguage()
  const isArabic = locale === 'ar'
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const points = entries.length * 10
  const badges = [
    { min: 1, icon: <Medal aria-hidden="true" />, en: 'First chapter', ar: 'الفصل الأول' },
    { min: 5, icon: <Flame aria-hidden="true" />, en: 'Reading rhythm', ar: 'مواظب على القراءة' },
    { min: 10, icon: <Crown aria-hidden="true" />, en: 'LIVA bookworm', ar: 'قارئ متميز' },
    { min: 25, icon: <Sparkles aria-hidden="true" />, en: 'Literary explorer', ar: 'مستكشف الأدب' },
  ]

  useEffect(() => {
    const refresh = () => setEntries(readProgress())
    refresh()
    window.addEventListener('liva-progress-updated', refresh)
    return () => window.removeEventListener('liva-progress-updated', refresh)
  }, [])

  return (
    <main className="library-page progress-page" dir={isArabic ? 'rtl' : 'ltr'} lang={locale}>
      <header className="library-topbar">
        <Link className="library-brand" href="/" aria-label="LIVA">
          <Image src="/liva-mark.svg" alt="" width={32} height={32} className="library-logo-mark" />
          <span>LIVA</span>
        </Link>
        <nav className="library-nav" aria-label={isArabic ? 'التنقل' : 'Navigation'}>
          <Link href="/library">{isArabic ? 'الكتب' : 'Books'}</Link>
          <Link href="/clubs">{isArabic ? 'نوادي القراءة' : 'Reading clubs'}</Link>
          <Link href="/community">{isArabic ? 'المجتمع' : 'Community'}</Link>
        </nav>
        <div className="library-header-actions"><LanguageSwitch /><Link className="library-home-link" href="/">{isArabic ? 'الرئيسية' : 'Home'} <ArrowLeft aria-hidden="true" /></Link></div>
      </header>
      <section className="progress-hero">
        <span className="library-eyebrow"><BookOpen aria-hidden="true" /> {isArabic ? 'رحلتك في القراءة' : 'Your reading journey'}</span>
        <h1>{isArabic ? <>كل فصل تقرؤه<br /><em>خطوة تستحق التقدير.</em></> : <>Every chapter counts.<br /><em>Keep your reading alive.</em></>}</h1>
        <p>{isArabic ? 'أكمل الفصول واجمع النقاط وافتح الشارات. يُحفظ هذا التقدم على هذا المتصفح دون أي خدمة مدفوعة.' : 'Complete chapters, collect points, and unlock badges. Your progress is saved in this browser without a paid service.'}</p>
      </section>
      <section className="progress-summary">
        <article><span>{isArabic ? 'الفصول المكتملة' : 'Completed chapters'}</span><strong>{entries.length}</strong></article>
        <article><span>{isArabic ? 'النقاط' : 'Points'}</span><strong>{points}</strong></article>
        <article><span>{isArabic ? 'الشارات المفتوحة' : 'Badges unlocked'}</span><strong>{badges.filter((badge) => entries.length >= badge.min).length}</strong></article>
      </section>
      <section className="progress-badges">
        <div className="progress-section-title"><h2>{isArabic ? 'شاراتك' : 'Your badges'}</h2><span>{isArabic ? 'كل 10 نقاط لكل فصل' : '10 points per chapter'}</span></div>
        <div className="progress-badge-grid">
          {badges.map((badge) => {
            const unlocked = entries.length >= badge.min
            return <article className={`progress-badge${unlocked ? ' is-unlocked' : ''}`} key={badge.min}>
              <span>{badge.icon}</span><strong>{isArabic ? badge.ar : badge.en}</strong>
              <small>{unlocked ? (isArabic ? 'مفتوحة' : 'Unlocked') : (isArabic ? `أكمل ${badge.min} فصول` : `Complete ${badge.min} chapters`)}</small>
            </article>
          })}
        </div>
      </section>
      <section className="progress-history">
        <div className="progress-section-title"><h2>{isArabic ? 'سجل القراءة' : 'Reading history'}</h2><button type="button" onClick={() => { window.localStorage.removeItem(STORAGE_KEY); setEntries([]); window.dispatchEvent(new Event('liva-progress-updated')) }} disabled={!entries.length}>{isArabic ? 'مسح التقدم' : 'Clear progress'}</button></div>
        {entries.length ? <ul>{entries.map((entry) => <li key={entry.id}><Check aria-hidden="true" /><span><strong>{entry.title}</strong><small>{entry.detail}</small></span><time>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(entry.completedAt))}</time></li>)}</ul> : <div className="progress-empty"><BookOpen aria-hidden="true" /><p>{isArabic ? 'لم تكمل أي فصل بعد. ابدأ القراءة وستظهر إنجازاتك هنا.' : 'No completed chapters yet. Start reading and your achievements will appear here.'}</p><Link href="/library">{isArabic ? 'اكتشف الكتب' : 'Explore books'} <ArrowLeft aria-hidden="true" /></Link></div>}
      </section>
      <p className="progress-storage-note">{isArabic ? 'ملاحظة: التقدم محفوظ محليًا في هذا المتصفح، ولا يتزامن تلقائيًا بين الأجهزة.' : 'Note: progress is stored locally in this browser and does not automatically sync across devices.'}</p>
      <footer className="library-footer"><Link href="/">LIVA</Link><span>{isArabic ? 'استمر في القراءة.' : 'Keep turning pages.'}</span><Link href="/clubs">{isArabic ? 'نوادي القراءة' : 'Reading clubs'} <ArrowLeft /></Link></footer>
    </main>
  )
}
