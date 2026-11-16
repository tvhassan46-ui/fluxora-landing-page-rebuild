'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Users } from 'lucide-react'
import { LanguageSwitch } from '@/components/language-switch'
import { QuoteChat } from '@/components/quote-chat'
import { useLanguage } from '@/components/language-provider'
import { getReadingClub, readingClubs } from '@/lib/reading-clubs'

export function ReadingClubsPage({ slug }: { slug?: string }) {
  const { locale } = useLanguage()
  const isArabic = locale === 'ar'
  const activeClub = slug ? getReadingClub(slug) : undefined

  if (slug && !activeClub) return null

  return (
    <main className="library-page clubs-page" dir={isArabic ? 'rtl' : 'ltr'} lang={locale}>
      <header className="library-topbar">
        <Link className="library-brand" href="/" aria-label="LIVA">
          <Image src="/liva-mark.svg" alt="" width={32} height={32} className="library-logo-mark" />
          <span>LIVA</span>
        </Link>
        <nav className="library-nav" aria-label={isArabic ? 'التنقل' : 'Navigation'}>
          <Link href="/library">{isArabic ? 'الكتب' : 'Books'}</Link>
          <Link href="/novels">{isArabic ? 'الروايات' : 'Novels'}</Link>
          <Link href="/stories">{isArabic ? 'الحكايات' : 'Stories'}</Link>
          <Link href="/quotes">{isArabic ? 'الاقتباسات' : 'Quotes'}</Link>
          <Link href="/clubs" aria-current="page">{isArabic ? 'نوادي القراءة' : 'Reading clubs'}</Link>
        </nav>
        <div className="library-header-actions">
          <LanguageSwitch />
          <Link className="library-home-link" href="/">{isArabic ? 'الرئيسية' : 'Home'} {isArabic ? <ArrowRight /> : <ArrowLeft />}</Link>
        </div>
      </header>

      {activeClub ? (
        <>
          <section className="clubs-hero clubs-room-hero">
            <span className="library-eyebrow"><Users aria-hidden="true" /> {activeClub[locale].category}</span>
            <h1>{activeClub[locale].title}</h1>
            <p>{activeClub[locale].description}</p>
            <Link className="clubs-back-link" href="/clubs">{isArabic ? 'كل نوادي القراءة' : 'All reading clubs'} {isArabic ? <ArrowRight /> : <ArrowLeft />}</Link>
          </section>
          <QuoteChat mode={activeClub.chatMode} />
        </>
      ) : (
        <>
          <section className="clubs-hero">
            <span className="library-eyebrow"><BookOpen aria-hidden="true" /> {isArabic ? 'اقرأ مع الآخرين' : 'Read together'}</span>
            <h1>{isArabic ? <>القراءة أجمل<br /><em>حين نتشاركها.</em></> : <>Reading is richer<br /><em>when shared.</em></>}</h1>
            <p>{isArabic ? 'انضم إلى نادٍ يناسب اهتماماتك، وشارك أفكارك مع قراء آخرين. النقاشات محفوظة في مجتمع LIVA.' : 'Join a club that matches your interests and exchange ideas with other readers. Discussions are part of the LIVA community.'}</p>
          </section>
          <section className="reading-club-grid" aria-label={isArabic ? 'نوادي القراءة' : 'Reading clubs'}>
            {readingClubs.map((club, index) => (
              <Link className={`reading-club-card reading-club-${club.color}`} href={`/clubs/${club.slug}`} key={club.slug}>
                <span className="reading-club-number">0{index + 1}</span>
                <span className="reading-club-icon" aria-hidden="true">{club.icon}</span>
                <span className="reading-club-category">{club[locale].category}</span>
                <strong>{club[locale].title}</strong>
                <span className="reading-club-description">{club[locale].description}</span>
                <span className="reading-club-enter">{isArabic ? 'ادخل إلى النادي' : 'Enter club'} {isArabic ? <ArrowLeft /> : <ArrowRight />}</span>
              </Link>
            ))}
          </section>
        </>
      )}
      <footer className="library-footer">
        <Link href="/">LIVA</Link>
        <span>{isArabic ? 'مساحة تجمع محبي القراءة.' : 'A place for people who love reading.'}</span>
        <Link href="/community">{isArabic ? 'مجتمع القراء' : 'Reader community'} {isArabic ? <ArrowLeft /> : <ArrowRight />}</Link>
      </footer>
    </main>
  )
}
