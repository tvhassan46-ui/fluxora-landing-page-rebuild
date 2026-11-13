'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, Copy, ExternalLink, Quote } from 'lucide-react'
import { publicQuotes } from '@/lib/reader-catalog'
import { LanguageSwitch } from '@/components/language-switch'
import { useLanguage } from '@/components/language-provider'
import { QuoteChat } from '@/components/quote-chat'
import { getQuotesCopy } from '@/lib/quotes-copy'
import { quoteTranslations } from '@/lib/reader-translations'

export function QuoteLibrary() {
  const { locale } = useLanguage()
  const copy = getQuotesCopy(locale)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function copyQuote(id: string, lines: string[]) {
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopiedId(id)
    } catch {
      setCopiedId(null)
    }
  }

  return (
    <main className="library-page quote-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <header className="library-topbar">
        <Link className="library-brand" href="/" aria-label={locale === 'ar' ? 'العودة إلى LIVRA' : 'Back to LIVRA'}><Image src="/livra-logo.svg" alt="" width={32} height={32} className="library-logo-mark" /><span>LIVRA</span></Link>
        <nav className="library-nav" aria-label={copy.nav.aria}><Link href="/library">{copy.nav.books}</Link><Link href="/novels">{copy.nav.novels}</Link><Link href="/stories">{copy.nav.stories}</Link><Link href="/quotes" aria-current="page">{copy.nav.quotes}</Link></nav>
        <div className="library-header-actions"><LanguageSwitch /><Link className="library-home-link" href="/">{copy.home} <ArrowLeft aria-hidden="true" /></Link></div>
      </header>
      <section className="quotes-hero" aria-labelledby="quotes-title">
        <span className="library-eyebrow"><Quote aria-hidden="true" /> {copy.eyebrow}</span>
        <h1 id="quotes-title">{copy.title[0]}<br /><em>{copy.title[1]}</em></h1>
        <p>{copy.description}</p>
      </section>
      <section className="quote-grid" aria-label={copy.gridLabel}>
        {publicQuotes.map((quote, index) => {
          const translated = locale === 'en' ? quoteTranslations[quote.id] : undefined
          const lines = translated?.lines ?? quote.lines
          return (
            <article className="quote-card" key={quote.id}>
              <span className="quote-number">0{index + 1}</span>
              <Quote className="quote-mark" aria-hidden="true" />
              <blockquote>{lines.map((line) => <p key={line}>{line}</p>)}</blockquote>
              <div className="quote-credit"><span>{translated?.author ?? quote.author}</span><a href={quote.sourceUrl} target="_blank" rel="noreferrer">{copy.source} <ExternalLink aria-hidden="true" /></a></div>
              <button type="button" className="copy-quote-button" onClick={() => void copyQuote(quote.id, lines)}>
                {copiedId === quote.id ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                {copiedId === quote.id ? copy.copied : copy.copy}
              </button>
            </article>
          )
        })}
      </section>
      <QuoteChat />
      <footer className="library-footer"><Link href="/">LIVRA</Link><span>{copy.footer}</span><Link href="/library">{copy.discoverBooks} <ArrowLeft aria-hidden="true" /></Link></footer>
    </main>
  )
}
