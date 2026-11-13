'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, ExternalLink, Headphones, Languages, Library, Pause, Play, RotateCw } from 'lucide-react'
import { publicBooks, type PublicBook } from '@/lib/reader-catalog'
import { LanguageSwitch } from '@/components/language-switch'
import { useLanguage } from '@/components/language-provider'
import { getLibraryCopy } from '@/lib/library-copy'
import { bookTranslations } from '@/lib/reader-translations'

type PublicLibraryProps = { collection: 'books' | 'novels' | 'stories' }
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
  if (!response.ok) throw new Error('Unable to load the text right now.')
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

function BookCover({ book, locale }: { book: PublicBook; locale: 'en' | 'ar' }) {
  const translated = locale === 'en' ? bookTranslations[book.id] : undefined
  const title = translated?.title ?? book.title
  const author = translated?.author ?? book.author
  return (
    <div className={`book-cover book-cover-${book.id}`}>
      <Image src={book.coverImage} alt={locale === 'ar' ? `غلاف كتاب ${title}` : `Cover of ${title}`} fill sizes="(max-width: 620px) 98px, (max-width: 850px) 120px, 145px" className="book-cover-image" />
      <span className="book-cover-frame" aria-hidden="true" />
      <span className="book-cover-mark" aria-hidden="true">{title.slice(0, 1)}</span>
      <span className="book-cover-title">{title}</span>
      <span className="book-cover-author">{author}</span>
    </div>
  )
}

export function PublicLibrary({ collection }: PublicLibraryProps) {
  const { locale } = useLanguage()
  const copy = getLibraryCopy(locale)
  const books = collection === 'novels'
    ? publicBooks.filter((book) => book.genre === 'novel')
    : collection === 'stories'
      ? publicBooks.filter((book) => book.genre === 'story-collection' || book.genre === 'fables')
      : publicBooks.filter((book) => book.genre === 'literary-journey')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [fontSize, setFontSize] = useState(1.25)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [audioMessage, setAudioMessage] = useState('')
  const [isPreparingAudio, setIsPreparingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioAbortRef = useRef<AbortController | null>(null)
  const audioRequestRef = useRef(0)
  const audioUrlCacheRef = useRef<Map<string, string>>(new Map())
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isEnglish, setIsEnglish] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationMessage, setTranslationMessage] = useState('')
  const readerRef = useRef<HTMLElement>(null)
  const chapterKeyRef = useRef<string | null>(null)
  const activeBook = books.find((book) => book.id === selection?.bookId)
  const activeEpisode = activeBook?.episodes.find((episode) => episode.id === selection?.episodeId)
  const activeBookTranslation = activeBook && locale === 'en' ? bookTranslations[activeBook.id] : undefined
  const activeBookTitle = activeBookTranslation?.title ?? activeBook?.title ?? ''
  const activeEpisodeTitle = activeBookTranslation?.episodes[activeEpisode?.id ?? ''] ?? activeEpisode?.title ?? ''
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

  useEffect(() => {
    audioRequestRef.current += 1
    audioAbortRef.current?.abort()
    audioAbortRef.current = null
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.currentTime = 0
    setAudioState('idle')
    setIsPreparingAudio(false)
    setAudioMessage('')
  }, [chapterKey, isEnglish])

  useEffect(() => () => {
    audioAbortRef.current?.abort()
    audioRef.current?.pause()
    for (const url of audioUrlCacheRef.current.values()) URL.revokeObjectURL(url)
    audioUrlCacheRef.current.clear()
  }, [])

  function stopAudio() {
    audioRequestRef.current += 1
    audioAbortRef.current?.abort()
    audioAbortRef.current = null
    const audio = audioRef.current
    audio?.pause()
    if (audio) audio.currentTime = 0
    setIsPreparingAudio(false)
    setAudioState('idle')
  }

  function openBook(book: PublicBook) {
    stopAudio()
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
    stopAudio()
    setChapterIndex(0)
    setAudioState('idle')
    setAudioMessage('')
    setIsEnglish(false)
    setTranslationMessage('')
    setSelection({ bookId: book.id, episodeId })
  }

  async function toggleEnglishTranslation() {
    if (!readerKey || !chapterKey || !currentChapter.length) return

    stopAudio()
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
        throw new Error(copy.translationFailed)
      }

      setTranslations((current) => ({ ...current, [requestedChapterKey]: result.translation as string }))
      if (chapterKeyRef.current === requestedChapterKey) setIsEnglish(true)
    } catch {
      if (chapterKeyRef.current === requestedChapterKey) {
        setTranslationMessage(copy.translateError)
      }
    } finally {
      setIsTranslating(false)
    }
  }

  async function toggleAudio() {
    const audio = audioRef.current
    if (!audio) return

    if (audioState === 'playing') {
      audio.pause()
      setAudioState('paused')
      return
    }

    if (audioState === 'paused') {
      try {
        await audio.play()
        setAudioState('playing')
        setAudioMessage('')
      } catch {
        setAudioState('idle')
        setAudioMessage(copy.voiceError)
      }
      return
    }

    if (!currentChapter.length) {
      setAudioMessage(copy.loadBeforeAudio)
      return
    }

    const language = isEnglish && translatedText ? 'en' : 'ar'
    const textToRead = isEnglish && translatedText ? translatedText : currentChapter.join(String.fromCharCode(10, 10))
    const cacheKey = language + '|' + textToRead
    const cachedUrl = audioUrlCacheRef.current.get(cacheKey)
    const requestId = ++audioRequestRef.current

    setAudioMessage('')
    setIsPreparingAudio(true)

    try {
      let audioUrl = cachedUrl
      if (!audioUrl) {
        const controller = new AbortController()
        audioAbortRef.current = controller
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToRead, language }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const result = await response.json().catch(() => null) as { error?: unknown; code?: unknown } | null
          throw new Error(result?.code === 'TTS_NOT_CONFIGURED' ? copy.voiceNotConfigured : copy.voiceError)
        }

        const audioBlob = await response.blob()
        if (requestId !== audioRequestRef.current) return

        audioUrl = URL.createObjectURL(audioBlob)
        audioUrlCacheRef.current.set(cacheKey, audioUrl)

        while (audioUrlCacheRef.current.size > 5) {
          const oldestEntry = audioUrlCacheRef.current.entries().next().value as [string, string] | undefined
          if (!oldestEntry) break
          URL.revokeObjectURL(oldestEntry[1])
          audioUrlCacheRef.current.delete(oldestEntry[0])
        }
      }

      if (requestId !== audioRequestRef.current) return
      audio.src = audioUrl
      audio.currentTime = 0
      await audio.play()
      if (requestId === audioRequestRef.current) setAudioState('playing')
    } catch (error) {
      if (requestId !== audioRequestRef.current) return
      if (error instanceof Error && error.name === 'AbortError') return
      setAudioState('idle')
      setAudioMessage(error instanceof Error ? error.message : copy.voiceError)
    } finally {
      if (requestId === audioRequestRef.current) {
        setIsPreparingAudio(false)
        audioAbortRef.current = null
      }
    }
  }

  return (
    <main className="library-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <audio ref={audioRef} preload="none" onEnded={() => { setAudioState('idle'); setAudioMessage('') }} onError={() => { setAudioState('idle'); setAudioMessage(copy.voiceError) }} />
      <header className="library-topbar">
        <Link className="library-brand" href="/" aria-label={locale === 'ar' ? 'العودة إلى LIVA' : 'Back to LIVA'}>
          <Image src="/liva-mark.svg" alt="" width={32} height={32} className="library-logo-mark" />
          <span>LIVA</span>
        </Link>
        <nav className="library-nav" aria-label={copy.nav.aria}>
          <Link href="/library" aria-current={collection === 'books' ? 'page' : undefined}>{copy.nav.books}</Link>
          <Link href="/novels" aria-current={collection === 'novels' ? 'page' : undefined}>{copy.nav.novels}</Link>
          <Link href="/stories" aria-current={collection === 'stories' ? 'page' : undefined}>{copy.nav.stories}</Link>
          <Link href="/quotes">{copy.nav.quotes}</Link>
        </nav>
        <div className="library-header-actions"><LanguageSwitch /><Link className="library-home-link" href="/">{copy.homeLabel} <ArrowLeft aria-hidden="true" /></Link></div>
      </header>

      <section className="library-hero" aria-labelledby="library-title">
        <div className="library-hero-copy">
          <span className="library-eyebrow"><Library aria-hidden="true" /> {copy.eyebrow}</span>
          <h1 id="library-title">{copy.heroTitle[0]}<br /><em>{copy.heroTitle[1]}</em></h1>
          <p>{copy.heroDescription}</p>
          <a className="library-hero-cta" href="#book-collection">{copy.browseBooks} <ArrowDown aria-hidden="true" /></a>
        </div>
        <div className="library-hero-art" aria-hidden="true">
          {publicBooks.slice(0, 3).map((book, index) => <div className={`hero-orbit-cover hero-orbit-cover-${index + 1}`} key={book.id}><Image src={book.coverImage} alt="" fill sizes="110px" /></div>)}
          <div className="hero-book hero-book-back"><span>{locale === 'ar' ? 'حكايات' : 'Stories'}</span></div>
          <div className="hero-book hero-book-front"><BookOpen /><strong>{locale === 'ar' ? <>اقرأ<br />الحكاية</> : <>Read<br />the story</>}</strong><small>{locale === 'ar' ? 'نصوص تراثية مجانية' : 'Free classic texts'}</small></div>
          <span className="hero-orbit hero-orbit-one" /><span className="hero-orbit hero-orbit-two" />
        </div>
      </section>

      <section id="book-collection" className="book-collection" aria-labelledby="collection-title">
        <div className="library-section-heading">
          <div><span className="library-eyebrow">{copy.sectionEyebrow}</span><h2 id="collection-title">{copy.sectionTitle[collection]}</h2></div>
          <p>{copy.sectionDescription[collection]}</p>
        </div>
        <div className="book-grid">
          {books.map((book, index) => {
            const translated = locale === 'en' ? bookTranslations[book.id] : undefined
            const title = translated?.title ?? book.title
            return (
              <article className="library-book-card" key={book.id}>
                <BookCover book={book} locale={locale} />
                <div className="library-book-info">
                  <span className="book-index">{copy.bookNumber} {String(index + 1).padStart(2, '0')} / {translated?.genreLabel ?? book.genreLabel}</span>
                  <h3>{title}</h3>
                  <p className="book-byline"><span>{translated?.author ?? book.author}</span><span aria-hidden="true">·</span><span>{translated?.period ?? book.period}</span></p>
                  <p className="book-description">{translated?.description ?? book.description}</p>
                  <div className="book-card-actions">
                    <button type="button" className="read-book-button" onClick={() => openBook(book)}>
                      <BookOpen aria-hidden="true" /> {copy.beginReading}
                    </button>
                    <a href={book.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${copy.openSource} ${title}`}>
                      {copy.originalSource} <ExternalLink aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section ref={readerRef} className="reader-section" aria-labelledby="reader-title" aria-busy={isLoading}>
        {!activeBook || !activeEpisode ? (
          <div className="reader-empty">
            <span className="reader-empty-icon"><BookOpen aria-hidden="true" /></span>
            <p className="library-eyebrow">{copy.readerSpace}</p>
            <h2 id="reader-title">{copy.chooseBook}</h2>
            <p>{copy.chooseBookHint}</p>
          </div>
        ) : (
          <div className="reader-paper">
            <div className="reader-heading">
              <div>
                <span className="reader-kicker">{activeBookTitle} <span aria-hidden="true">/</span> {activeEpisodeTitle}</span>
                <h2 id="reader-title">{activeBook.episodes.length > 1 ? activeEpisodeTitle : `${copy.chapter} ${chapterIndex + 1}`}</h2>
                <p>{activeBookTranslation?.author ?? activeBook.author} · {activeBookTranslation?.genreLabel ?? activeBook.genreLabel}</p>
              </div>
              <div className="reader-tools" aria-label={copy.readerSettings}>
                <button className="translation-button" type="button" onClick={() => void toggleEnglishTranslation()} disabled={!currentChapter.length || isTranslating} aria-busy={isTranslating} aria-pressed={isEnglish} aria-label={isEnglish ? copy.showArabic : copy.translate}>
                  <Languages aria-hidden="true" />{isTranslating ? copy.translating : isEnglish ? copy.showArabic : copy.translate}
                </button>
                <button className="audio-button" type="button" onClick={() => void toggleAudio()} disabled={!currentChapter.length || isPreparingAudio} aria-busy={isPreparingAudio} aria-pressed={audioState === 'playing'} aria-label={audioState === 'playing' ? copy.pause : audioState === 'paused' ? copy.resume : copy.listen}>
                  {audioState === 'playing' ? <Pause aria-hidden="true" /> : audioState === 'paused' ? <Play aria-hidden="true" /> : <Headphones aria-hidden="true" />}
                  {isPreparingAudio ? copy.preparingAudio : audioState === 'playing' ? copy.pauseLabel : audioState === 'paused' ? copy.resumeLabel : copy.listenLabel}
                </button>
                <button type="button" onClick={() => setFontSize((size) => Math.max(1, +(size - 0.1).toFixed(1)))} aria-label={copy.decreaseFont}>A−</button>
                <button type="button" onClick={() => setFontSize((size) => Math.min(1.8, +(size + 0.1).toFixed(1)))} aria-label={copy.increaseFont}>A+</button>
              </div>
            </div>
            {translationMessage && <p className="audio-status" role="alert">{translationMessage}</p>}
            {audioMessage && <p className="audio-status" role="status">{audioMessage}</p>}
            {activeBook.episodes.length > 1 && (
              <nav className="episode-nav" aria-label={`${copy.chapters} ${activeBookTitle}`}>
                {activeBook.episodes.map((episode, index) => (
                  <button key={episode.id} type="button" className={episode.id === activeEpisode.id ? 'is-selected' : ''} aria-pressed={episode.id === activeEpisode.id} onClick={() => selectEpisode(activeBook, episode.id)}>
                    <span>{copy.chapter} {String(index + 1).padStart(2, '0')}</span>{activeBookTranslation?.episodes[episode.id] ?? episode.title}
                  </button>
                ))}
              </nav>
            )}
            {chapters.length > 1 && (
              <nav className="episode-nav chapter-nav" aria-label={`${copy.chapters} ${activeBookTitle}`}>
                {chapters.map((_, index) => (
                  <button key={index} type="button" className={index === chapterIndex ? 'is-selected' : ''} aria-pressed={index === chapterIndex} onClick={() => { stopAudio(); setChapterIndex(index); setAudioMessage(''); setIsEnglish(false); setTranslationMessage('') }}>
                    <span>{activeBook.episodes.length > 1 ? activeEpisodeTitle : activeBookTitle}</span>{copy.chapter} {String(index + 1).padStart(2, '0')}
                  </button>
                ))}
              </nav>
            )}
            {isLoading && <div className="reader-status" role="status">{copy.loadingChapter}</div>}
            {error && (
              <div className="reader-error" role="alert">
                <p>{copy.loadError}</p>
                <button type="button" onClick={() => void mutate()}><RotateCw aria-hidden="true" /> {copy.retry}</button>
              </div>
            )}
            {data && !isLoading && (
              <>
                <div className="reader-text" dir={isEnglish ? 'ltr' : 'rtl'} lang={isEnglish ? 'en' : 'ar'} aria-live="polite" style={{ fontSize: `${fontSize}rem` }}>
                  <p className="reader-language-note">{isEnglish ? (locale === 'ar' ? 'الترجمة الإنجليزية' : 'English translation') : copy.originalArabic}</p>
                  {displayedParagraphs.map((paragraph, index) => <p key={`${chapterIndex}-${isEnglish ? 'en' : 'ar'}-${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>)}
                </div>
                <footer className="reader-source">
                  <span>{copy.sourceDisclosure}</span>
                  <a href={data.sourceUrl} target="_blank" rel="noreferrer">{locale === 'ar' ? data.sourceTitle : copy.originalSource} <ExternalLink aria-hidden="true" /></a>
                </footer>
              </>
            )}
          </div>
        )}
      </section>

      <footer className="library-footer">
        <Link href="/">LIVA</Link>
        <span>{copy.footer}</span>
        <Link href="/quotes">{copy.moreQuotes} <ArrowRight aria-hidden="true" /></Link>
      </footer>
    </main>
  )
}
