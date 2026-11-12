'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, ExternalLink, Headphones, Languages, Library, Pause, Play, RotateCw } from 'lucide-react'
import { publicBooks, type PublicBook } from '@/lib/reader-catalog'

type PublicLibraryProps = { collection: 'all' | 'novels' }
type Selection = { bookId: string; episodeId: string }
type ReaderResponse = {
  bookTitle: string
  episodeTitle: string
  html: string
  sourceTitle: string
  sourceUrl: string
}

async function fetchReaderText(url: string): Promise<ReaderResponse> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('تعذّر تحميل النص الآن.')
  return response.json() as Promise<ReaderResponse>
}

function getReaderParagraphs(html: string): string[] {
  if (typeof DOMParser === 'undefined') return []

  const document = new DOMParser().parseFromString(html, 'text/html')
  const content = document.querySelector('.mw-parser-output') ?? document.body
  content.querySelectorAll('style, script, .mw-editsection, .noprint, .catlinks, .references, table').forEach((element) => element.remove())
  const text = (content as HTMLElement).innerText || content.textContent || ''

  return text
    .replace(/[\u200b\u200e\u200f]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 1 && !/^\[\s*عدل\s*\]$/.test(paragraph))
}

function splitReaderChapters(paragraphs: string[]): string[][] {
  const chapters: string[][] = []
  let currentChapter: string[] = []
  let currentLength = 0

  for (const paragraph of paragraphs) {
    const blocks = paragraph.match(/[\s\S]{1,2200}(?:\s|$)/g) ?? [paragraph]
    for (const block of blocks) {
      const cleanedBlock = block.trim()
      if (!cleanedBlock) continue
      if (currentLength + cleanedBlock.length > 4200 && currentChapter.length) {
        chapters.push(currentChapter)
        currentChapter = []
        currentLength = 0
      }
      currentChapter.push(cleanedBlock)
      currentLength += cleanedBlock.length
    }
  }

  if (currentChapter.length) chapters.push(currentChapter)
  return chapters
}

function BookCover({ book }: { book: PublicBook }) {
  const initial = book.title.slice(0, 1)
  return (
    <div className={`book-cover book-cover-${book.id}`}>
      <Image src={book.coverImage} alt={`غلاف كتاب ${book.title}`} fill sizes="(max-width: 620px) 98px, (max-width: 850px) 120px, 145px" className="book-cover-image" />
      <span className="book-cover-frame" aria-hidden="true" />
      <span className="book-cover-mark">{initial}</span>
      <span className="book-cover-title">{book.title}</span>
      <span className="book-cover-author">{book.author}</span>
    </div>
  )
}

export function PublicLibrary({ collection }: PublicLibraryProps) {
  const books = collection === 'novels'
    ? publicBooks.filter((book) => book.genre !== 'fables')
    : publicBooks
  const [selection, setSelection] = useState<Selection | null>(null)
  const [fontSize, setFontSize] = useState(1.25)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [audioMessage, setAudioMessage] = useState('')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isEnglish, setIsEnglish] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationMessage, setTranslationMessage] = useState('')
  const readerRef = useRef<HTMLElement>(null)
  const chapterKeyRef = useRef<string | null>(null)
  const activeBook = books.find((book) => book.id === selection?.bookId)
  const activeEpisode = activeBook?.episodes.find((episode) => episode.id === selection?.episodeId)
  const readerKey = activeBook && activeEpisode
    ? `/api/library/${activeBook.id}?episode=${activeEpisode.id}`
    : null
  const { data, error, isLoading, mutate } = useSWR<ReaderResponse>(readerKey, fetchReaderText, {
    revalidateOnFocus: false,
    errorRetryCount: 2,
  })
  const paragraphs = useMemo(() => data ? getReaderParagraphs(data.html) : [], [data?.html])
  const chapters = useMemo(() => splitReaderChapters(paragraphs), [paragraphs])
  const currentChapter = chapters[chapterIndex] ?? []
  const chapterKey = readerKey ? `${readerKey}:${chapterIndex}` : null
  chapterKeyRef.current = chapterKey
  const translatedText = chapterKey ? translations[chapterKey] : undefined
  const displayedParagraphs = isEnglish && translatedText
    ? translatedText.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : currentChapter

  useEffect(() => () => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }, [chapterIndex, isEnglish, readerKey])

  function openBook(book: PublicBook) {
    const firstEpisode = book.episodes[0]
    setChapterIndex(0)
    setAudioState('idle')
    setAudioMessage('')
    setIsEnglish(false)
    setTranslationMessage('')
    setSelection({ bookId: book.id, episodeId: firstEpisode.id })
    window.requestAnimationFrame(() => readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function selectEpisode(book: PublicBook, episodeId: string) {
    setChapterIndex(0)
    setAudioState('idle')
    setAudioMessage('')
    setIsEnglish(false)
    setTranslationMessage('')
    setSelection({ bookId: book.id, episodeId })
  }

  async function toggleEnglishTranslation() {
    if (!readerKey || !chapterKey || !currentChapter.length) return

    window.speechSynthesis?.cancel()
    setAudioState('idle')
    setAudioMessage('')
    setTranslationMessage('')

    if (translatedText) {
      setIsEnglish((current) => !current)
      return
    }

    const requestedChapterKey = chapterKey
    setIsTranslating(true)

    try {
      const response = await fetch(readerKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentChapter.join('\n\n') }),
      })
      const result = await response.json().catch(() => null) as { translation?: unknown } | null

      if (!response.ok || typeof result?.translation !== 'string') {
        throw new Error('Translation request failed')
      }

      setTranslations((current) => ({ ...current, [requestedChapterKey]: result.translation as string }))
      if (chapterKeyRef.current === requestedChapterKey) setIsEnglish(true)
    } catch {
      if (chapterKeyRef.current === requestedChapterKey) {
        setTranslationMessage('تعذّرت الترجمة الآن. حاول مرة أخرى بعد قليل.')
      }
    } finally {
      setIsTranslating(false)
    }
  }

  function toggleAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioMessage('القراءة الصوتية غير مدعومة في هذا المتصفح.')
      return
    }

    if (!currentChapter.length) {
      setAudioMessage('حمّل الفصل أولًا ثم اضغط استمع.')
      return
    }

    if (audioState === 'playing') {
      window.speechSynthesis.pause()
      setAudioState('paused')
      return
    }

    if (audioState === 'paused') {
      window.speechSynthesis.resume()
      setAudioState('playing')
      return
    }

    window.speechSynthesis.cancel()
    const language = isEnglish ? 'en' : 'ar'
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith(language))
    const utterance = new SpeechSynthesisUtterance(isEnglish && translatedText ? translatedText : currentChapter.join('\n\n'))
    utterance.voice = voice ?? null
    utterance.lang = voice?.lang ?? (isEnglish ? 'en-US' : 'ar-SA')
    utterance.rate = 0.92
    utterance.onstart = () => setAudioState('playing')
    utterance.onend = () => {
      setAudioState('idle')
      setAudioMessage('')
    }
    utterance.onerror = (event) => {
      setAudioState('idle')
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        setAudioMessage(`تعذّر تشغيل الصوت. تحقق من تفعيل الصوت أو تثبيت صوت ${isEnglish ? 'إنجليزي' : 'عربي'} في الجهاز.`)
      }
    }
    setAudioMessage(voice ? '' : `لم يُعثر على صوت ${isEnglish ? 'إنجليزي' : 'عربي'} مثبت؛ سيحاول المتصفح استخدام صوته الافتراضي.`)
    window.speechSynthesis.speak(utterance)
    setAudioState('playing')
  }

  return (
    <main className="library-page" dir="rtl" lang="ar">
      <header className="library-topbar">
        <Link className="library-brand" href="/" aria-label="العودة إلى Hikaya">
          <span className="library-brand-mark" aria-hidden="true">H</span>
          <span>Hikaya <i>قراءة</i></span>
        </Link>
        <nav className="library-nav" aria-label="التنقل بين الصفحات">
          <Link href="/library">المكتبة</Link>
          <Link href="/novels">الروايات والحكايات</Link>
          <Link href="/quotes">اقتباسات</Link>
        </nav>
        <Link className="library-home-link" href="/">الرئيسية <ArrowLeft aria-hidden="true" /></Link>
      </header>

      <section className="library-hero" aria-labelledby="library-title">
        <div className="library-hero-copy">
          <span className="library-eyebrow"><Library aria-hidden="true" /> مكتبة مفتوحة للجميع</span>
          <h1 id="library-title">حكايات عظيمة،<br /><em>وقراءة بلا حدود.</em></h1>
          <p>اقرأ كتبًا تراثية فصلًا بعد فصل، واختر المقطع الذي تريده. النصوص مجانية وروابط مصادرها الأصلية متاحة مع كل كتاب.</p>
          <a className="library-hero-cta" href="#book-collection">تصفّح الكتب <ArrowDown aria-hidden="true" /></a>
        </div>
        <div className="library-hero-art" aria-hidden="true">
          <div className="hero-book hero-book-back"><span>حكايات</span></div>
          <div className="hero-book hero-book-front"><BookOpen /><strong>اقرأ<br />الحكاية</strong><small>نصوص تراثية مجانية</small></div>
          <span className="hero-orbit hero-orbit-one" /><span className="hero-orbit hero-orbit-two" />
        </div>
      </section>

      <section id="book-collection" className="book-collection" aria-labelledby="collection-title">
        <div className="library-section-heading">
          <div><span className="library-eyebrow">اختيارات Hikaya</span><h2 id="collection-title">{collection === 'novels' ? 'روايات وحكايات' : 'ابدأ من هنا'}</h2></div>
          <p>{collection === 'novels' ? 'أعمال روائية ورحلات تخييلية من التراث العربي، مع النص الأصلي ومصدره.' : 'من الرواية الفلسفية إلى حكايات الليالي والأمثال.'}</p>
        </div>
        <div className="book-grid">
          {books.map((book, index) => (
            <article className="library-book-card" key={book.id}>
              <BookCover book={book} />
              <div className="library-book-info">
                <span className="book-index">{String(index + 1).padStart(2, '0')} / {book.genreLabel}</span>
                <h3>{book.title}</h3>
                <p className="book-byline">{book.author} <span aria-hidden="true">·</span> {book.period}</p>
                <p className="book-description">{book.description}</p>
                <div className="book-card-actions">
                  <button type="button" className="read-book-button" onClick={() => openBook(book)}>
                    <BookOpen aria-hidden="true" /> ابدأ القراءة
                  </button>
                  <a href={book.sourceUrl} target="_blank" rel="noreferrer" aria-label={`فتح مصدر ${book.title} على ويكي مصدر`}>
                    المصدر <ExternalLink aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section ref={readerRef} className="reader-section" aria-labelledby="reader-title" aria-busy={isLoading}>
        {!activeBook || !activeEpisode ? (
          <div className="reader-empty">
            <span className="reader-empty-icon"><BookOpen aria-hidden="true" /></span>
            <p className="library-eyebrow">مساحتك الهادئة للقراءة</p>
            <h2 id="reader-title">اختر كتابًا لتبدأ</h2>
            <p>اضغط «ابدأ القراءة» لتصفح فصول الكتاب واحدًا تلو الآخر.</p>
          </div>
        ) : (
          <div className="reader-paper">
            <div className="reader-heading">
              <div>
                <span className="reader-kicker">{activeBook.title} <span aria-hidden="true">/</span> {activeEpisode.title}</span>
                <h2 id="reader-title">{activeBook.episodes.length > 1 ? activeEpisode.title : `الفصل ${chapterIndex + 1}`}</h2>
                <p>{activeBook.author} · {activeBook.genreLabel}</p>
              </div>
              <div className="reader-tools" aria-label="إعدادات القراءة">
                <button className="translation-button" type="button" onClick={() => void toggleEnglishTranslation()} disabled={!currentChapter.length || isTranslating} aria-busy={isTranslating} aria-pressed={isEnglish} aria-label={isEnglish ? 'عرض النص العربي' : 'ترجمة هذا الفصل إلى الإنجليزية'}>
                  <Languages aria-hidden="true" />{isTranslating ? 'جارٍ الترجمة…' : isEnglish ? 'عرض العربية' : 'ترجم للإنجليزية'}
                </button>
                <button className="audio-button" type="button" onClick={toggleAudio} aria-pressed={audioState === 'playing'} aria-label={audioState === 'playing' ? 'إيقاف القراءة السمعية مؤقتًا' : audioState === 'paused' ? 'استئناف القراءة السمعية' : 'استمع إلى هذا الفصل'}>
                  {audioState === 'playing' ? <Pause aria-hidden="true" /> : audioState === 'paused' ? <Play aria-hidden="true" /> : <Headphones aria-hidden="true" />}
                  {audioState === 'playing' ? 'إيقاف مؤقت' : audioState === 'paused' ? 'استئناف' : 'استمع'}
                </button>
                <button type="button" onClick={() => setFontSize((size) => Math.max(1, +(size - 0.1).toFixed(1)))} aria-label="تصغير الخط">A−</button>
                <button type="button" onClick={() => setFontSize((size) => Math.min(1.8, +(size + 0.1).toFixed(1)))} aria-label="تكبير الخط">A+</button>
              </div>
            </div>
            {translationMessage && <p className="audio-status" role="alert">{translationMessage}</p>}
            {audioMessage && <p className="audio-status" role="status">{audioMessage}</p>}
            {activeBook.episodes.length > 1 && (
              <nav className="episode-nav" aria-label={`فصول ${activeBook.title}`}>
                {activeBook.episodes.map((episode, index) => (
                  <button key={episode.id} type="button" className={episode.id === activeEpisode.id ? 'is-selected' : ''} aria-pressed={episode.id === activeEpisode.id} onClick={() => selectEpisode(activeBook, episode.id)}>
                    <span>الفصل {String(index + 1).padStart(2, '0')}</span>{episode.title}
                  </button>
                ))}
              </nav>
            )}
            {chapters.length > 1 && (
              <nav className="episode-nav chapter-nav" aria-label={`فصول ${activeBook.title}`}>
                {chapters.map((_, index) => (
                  <button key={index} type="button" className={index === chapterIndex ? 'is-selected' : ''} aria-pressed={index === chapterIndex} onClick={() => { setChapterIndex(index); setAudioState('idle'); setAudioMessage(''); setIsEnglish(false); setTranslationMessage('') }}>
                    <span>{activeBook.episodes.length > 1 ? activeEpisode.title : activeBook.title}</span>الفصل {String(index + 1).padStart(2, '0')}
                  </button>
                ))}
              </nav>
            )}
            {isLoading && <div className="reader-status" role="status">جارٍ تحميل الفصل من ويكي مصدر…</div>}
            {error && (
              <div className="reader-error" role="alert">
                <p>لم نتمكن من تحميل النص الآن. يمكنك إعادة المحاولة أو فتح النسخة الأصلية.</p>
                <button type="button" onClick={() => void mutate()}><RotateCw aria-hidden="true" /> أعد المحاولة</button>
              </div>
            )}
            {data && !isLoading && (
              <>
                <div className="reader-text" dir={isEnglish ? 'ltr' : 'rtl'} lang={isEnglish ? 'en' : 'ar'} aria-live="polite" style={{ fontSize: `${fontSize}rem` }}>
                  {displayedParagraphs.map((paragraph, index) => <p key={`${chapterIndex}-${isEnglish ? 'en' : 'ar'}-${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>)}
                </div>
                <footer className="reader-source">
                  <span>النص متاح مجانًا عبر ويكي مصدر. انسب القراءة إلى المصدر الأصلي.</span>
                  <a href={data.sourceUrl} target="_blank" rel="noreferrer">{data.sourceTitle} <ExternalLink aria-hidden="true" /></a>
                </footer>
              </>
            )}
          </div>
        )}
      </section>

      <footer className="library-footer">
        <Link href="/">Hikaya</Link>
        <span>المعرفة أجمل حين تكون متاحة للجميع.</span>
        <Link href="/quotes">إلى الاقتباسات <ArrowRight aria-hidden="true" /></Link>
      </footer>
    </main>
  )
}
