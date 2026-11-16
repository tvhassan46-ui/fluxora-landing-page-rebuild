'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bookmark, Check, Share2, Trash2 } from 'lucide-react'
import { publicBooks } from '@/lib/reader-catalog'
import { useLanguage } from '@/components/language-provider'
import { LanguageSwitch } from '@/components/language-switch'

const STORAGE_KEY = 'liva-saved-books-v1'

function readSavedBooks(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function BookSocialActions({ bookId, title, href }: { bookId: string; title: string; href: string }) {
  const { locale } = useLanguage()
  const [saved, setSaved] = useState(false)
  const [shared, setShared] = useState(false)
  const isArabic = locale === 'ar'

  useEffect(() => {
    const refresh = () => setSaved(readSavedBooks().includes(bookId))
    refresh()
    window.addEventListener('liva-shelf-updated', refresh)
    return () => window.removeEventListener('liva-shelf-updated', refresh)
  }, [bookId])

  function toggleSaved() {
    const current = readSavedBooks()
    const next = saved ? current.filter((id) => id !== bookId) : [...new Set([...current, bookId])]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSaved(!saved)
    window.dispatchEvent(new Event('liva-shelf-updated'))
  }

  async function shareBook() {
    const url = `${window.location.origin}${href}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `LIVA · ${title}`, text: isArabic ? 'اكتشف هذا الكتاب على LIVA' : 'Discover this book on LIVA', url })
      } else {
        await navigator.clipboard.writeText(url)
        setShared(true)
        window.setTimeout(() => setShared(false), 1800)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setShared(false)
    }
  }

  return (
    <div className="book-social-actions">
      <button type="button" onClick={toggleSaved} aria-pressed={saved}>
        {saved ? <Check aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
        {saved ? (isArabic ? 'محفوظ في رفّي' : 'Saved to shelf') : (isArabic ? 'احفظ في رفّي' : 'Save to shelf')}
      </button>
      <button type="button" onClick={() => void shareBook()}>
        <Share2 aria-hidden="true" /> {shared ? (isArabic ? 'تم النسخ' : 'Link copied') : (isArabic ? 'شارك الكتاب' : 'Share')}
      </button>
    </div>
  )
}

export function ReadingShelf() {
  const { locale } = useLanguage()
  const isArabic = locale === 'ar'
  const [savedIds, setSavedIds] = useState<string[]>([])
  const savedBooks = publicBooks.filter((book) => savedIds.includes(book.id))

  useEffect(() => {
    const refresh = () => setSavedIds(readSavedBooks())
    refresh()
    window.addEventListener('liva-shelf-updated', refresh)
    return () => window.removeEventListener('liva-shelf-updated', refresh)
  }, [])

  function remove(bookId: string) {
    const next = savedIds.filter((id) => id !== bookId)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSavedIds(next)
    window.dispatchEvent(new Event('liva-shelf-updated'))
  }

  return (
    <main className="library-page shelf-page" dir={isArabic ? 'rtl' : 'ltr'} lang={locale}>
      <header className="library-topbar">
        <Link className="library-brand" href="/" aria-label="LIVA"><Image src="/liva-mark.svg" alt="" width={32} height={32} className="library-logo-mark" /><span>LIVA</span></Link>
        <nav className="library-nav"><Link href="/library">{isArabic ? 'الكتب' : 'Books'}</Link><Link href="/clubs">{isArabic ? 'نوادي القراءة' : 'Clubs'}</Link><Link href="/progress">{isArabic ? 'إنجازاتي' : 'Progress'}</Link></nav>
        <div className="library-header-actions"><LanguageSwitch /><Link className="library-home-link" href="/">{isArabic ? 'الرئيسية' : 'Home'}</Link></div>
      </header>
      <section className="shelf-hero">
        <span className="library-eyebrow">{isArabic ? 'مكتبتك الشخصية' : 'Your personal library'}</span>
        <h1>{isArabic ? 'رفّك، واختياراتك.' : 'Your shelf. Your stories.'}</h1>
        <p>{isArabic ? 'احتفظ بالكتب التي تريد العودة إليها وشاركها مع أصدقائك.' : 'Keep the books you want to return to and share them with friends.'}</p>
      </section>
      {savedBooks.length ? <section className="shelf-grid">{savedBooks.map((book) => <article className="shelf-card" key={book.id}>
        <Link href="/library" className="shelf-cover"><Image src={book.coverImage} alt={book.title} fill sizes="140px" /></Link>
        <div><strong>{isArabic ? book.title : book.id === 'hayy-ibn-yaqzan' ? 'Hayy ibn Yaqzan' : book.id === 'alf-layla' ? 'One Thousand and One Nights' : book.id === 'kalila-wa-dimna' ? 'Kalila and Dimna' : 'The Epistle of Forgiveness'}</strong><small>{isArabic ? book.author : book.id === 'hayy-ibn-yaqzan' ? 'Ibn Tufail' : book.id === 'alf-layla' ? 'Traditional stories' : book.id === 'kalila-wa-dimna' ? 'Ibn al-Muqaffa' : 'Al-Ma’arri'}</small><div><Link href="/library">{isArabic ? 'ابدأ القراءة' : 'Start reading'}</Link><button type="button" onClick={() => remove(book.id)} aria-label={isArabic ? 'إزالة الكتاب' : 'Remove book'}><Trash2 aria-hidden="true" /></button></div></div>
      </article>)}</section> : <section className="shelf-empty"><Bookmark aria-hidden="true" /><h2>{isArabic ? 'رفّك فارغ حاليًا' : 'Your shelf is empty'}</h2><p>{isArabic ? 'احفظ الكتب من صفحات المكتبة لتجدها هنا.' : 'Save books from the library and they will appear here.'}</p><Link href="/library">{isArabic ? 'تصفح المكتبة' : 'Browse the library'}</Link></section>}
      <footer className="library-footer"><Link href="/">LIVA</Link><span>{isArabic ? 'الكتب التي تحبها، في مكان واحد.' : 'The books you love, in one place.'}</span><Link href="/clubs">{isArabic ? 'نوادي القراءة' : 'Reading clubs'}</Link></footer>
    </main>
  )
}
