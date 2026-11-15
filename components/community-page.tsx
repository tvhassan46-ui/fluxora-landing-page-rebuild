'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LanguageSwitch } from '@/components/language-switch'
import { QuoteChat } from '@/components/quote-chat'
import { useLanguage } from '@/components/language-provider'
import { getQuoteChatCopy } from '@/lib/quote-chat-copy'
import { getQuotesCopy } from '@/lib/quotes-copy'

export function CommunityPage() {
  const { locale } = useLanguage()
  const quoteCopy = getQuotesCopy(locale)
  const chatCopy = getQuoteChatCopy(locale)

  return (
    <main className="library-page community-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <header className="library-topbar">
        <Link className="library-brand" href="/" aria-label={quoteCopy.home}>
          <Image src="/liva-mark.svg" alt="" width={32} height={32} className="library-logo-mark" />
          <span>LIVA</span>
        </Link>
        <nav className="library-nav" aria-label={quoteCopy.nav.aria}>
          <Link href="/library">{quoteCopy.nav.books}</Link>
          <Link href="/novels">{quoteCopy.nav.novels}</Link>
          <Link href="/stories">{quoteCopy.nav.stories}</Link>
          <Link href="/quotes">{quoteCopy.nav.quotes}</Link>
          <Link href="/community" aria-current="page">{chatCopy.communityTitle}</Link>
        </nav>
        <div className="library-header-actions">
          <LanguageSwitch />
          <Link className="library-home-link" href="/">{quoteCopy.home} <ArrowLeft aria-hidden="true" /></Link>
        </div>
      </header>
      <QuoteChat mode="community" />
      <footer className="library-footer">
        <Link href="/">LIVA</Link>
        <span>{chatCopy.communityFooter}</span>
        <Link href="/quotes">{quoteCopy.nav.quotes} <ArrowLeft aria-hidden="true" /></Link>
      </footer>
    </main>
  )
}
