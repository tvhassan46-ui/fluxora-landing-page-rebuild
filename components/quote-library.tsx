'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Copy, ExternalLink, Quote } from 'lucide-react'
import { publicQuotes } from '@/lib/reader-catalog'

export function QuoteLibrary() {
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
    <main className="library-page quote-page" dir="rtl" lang="ar">
      <header className="library-topbar">
        <Link className="library-brand" href="/" aria-label="العودة إلى Fluxora"><span className="library-brand-mark" aria-hidden="true">F</span><span>Fluxora <i>مختارات</i></span></Link>
        <nav className="library-nav" aria-label="التنقل بين الصفحات"><Link href="/library">المكتبة</Link><Link href="/novels">الروايات والحكايات</Link><Link href="/quotes" aria-current="page">اقتباسات</Link></nav>
        <Link className="library-home-link" href="/">الرئيسية <ArrowLeft aria-hidden="true" /></Link>
      </header>
      <section className="quotes-hero" aria-labelledby="quotes-title">
        <span className="library-eyebrow"><Quote aria-hidden="true" /> من دفاتر الشعر العربي</span>
        <h1 id="quotes-title">كلمات تبقى<br /><em>بعد أن ينتهي الكلام.</em></h1>
        <p>أبيات مختارة من قصيدة للمتنبي، مع إحالة مباشرة إلى النص الأصلي.</p>
      </section>
      <section className="quote-grid" aria-label="اقتباسات المتنبي">
        {publicQuotes.map((quote, index) => (
          <article className="quote-card" key={quote.id}>
            <span className="quote-number">0{index + 1}</span>
            <Quote className="quote-mark" aria-hidden="true" />
            <blockquote>{quote.lines.map((line) => <p key={line}>{line}</p>)}</blockquote>
            <div className="quote-credit"><span>{quote.author}</span><a href={quote.sourceUrl} target="_blank" rel="noreferrer">{quote.work} <ExternalLink aria-hidden="true" /></a></div>
            <button type="button" className="copy-quote-button" onClick={() => void copyQuote(quote.id, quote.lines)}>
              {copiedId === quote.id ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copiedId === quote.id ? 'نُسخ الاقتباس' : 'انسخ الاقتباس'}
            </button>
          </article>
        ))}
      </section>
      <footer className="library-footer"><Link href="/">Fluxora</Link><span>البيت الشعري يعيش كلما وجد قارئًا.</span><Link href="/library">اكتشف الكتب <ArrowLeft aria-hidden="true" /></Link></footer>
    </main>
  )
}
