import { gateway, generateText } from 'ai'
import { NextResponse } from 'next/server'
import { publicBooks } from '@/lib/reader-catalog'

type RouteContext = { params: Promise<{ bookId: string }> }

type WikisourceParseResponse = {
  parse?: { title?: string; text?: { '*': string } }
  error?: { info?: string }
}

export const maxDuration = 30

export async function POST(request: Request, { params }: RouteContext) {
  const { bookId } = await params
  const book = publicBooks.find((item) => item.id === bookId)

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => null) as { text?: unknown } | null
  const sourceText = typeof body?.text === 'string' ? body.text.trim() : ''

  if (!sourceText) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 })
  }

  if (sourceText.length > 12000) {
    return NextResponse.json({ error: 'Text is too long to translate in one request' }, { status: 413 })
  }

  try {
    const { text } = await generateText({
      model: gateway('google/gemini-3.8-flash-lite'),
      system: 'You are a careful Arabic-to-English literary translator. Translate the provided Arabic text faithfully into clear English. Preserve paragraph breaks, names, imagery, and meaning. Do not summarize, omit, or add commentary. Return only the English translation.',
      prompt: sourceText,
      maxOutputTokens: 4096,
    })

    if (!text.trim()) {
      return NextResponse.json({ error: 'Translation is empty' }, { status: 502 })
    }

    return NextResponse.json({ translation: text.trim() })
  } catch {
    return NextResponse.json({ error: 'Translation is temporarily unavailable' }, { status: 502 })
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  const { bookId } = await params
  const book = publicBooks.find((item) => item.id === bookId)

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  const episodeId = new URL(request.url).searchParams.get('episode')
  const episode = book.episodes.find((item) => item.id === episodeId) ?? book.episodes[0]
  const pageId = episode.pageId ?? book.pageId

  if (!pageId) {
    return NextResponse.json({ error: 'Text is unavailable' }, { status: 404 })
  }

  const query = new URLSearchParams({
    action: 'parse',
    pageid: String(pageId),
    prop: 'text',
    format: 'json',
  })

  if (episode.section) query.set('section', String(episode.section))

  try {
    const response = await fetch(`https://ar.wikisource.org/w/api.php?${query.toString()}`, {
      headers: { 'User-Agent': 'FluxoraReader/1.0 (public-domain Arabic reading)' },
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'The book source is temporarily unavailable' }, { status: 502 })
    }

    const result = (await response.json()) as WikisourceParseResponse
    const html = result.parse?.text?.['*']

    if (!html) {
      return NextResponse.json({ error: 'The selected text is unavailable' }, { status: 502 })
    }

    return NextResponse.json({
      bookTitle: book.title,
      episodeTitle: episode.title,
      html,
      sourceTitle: book.sourceTitle,
      sourceUrl: book.sourceUrl,
    })
  } catch {
    return NextResponse.json({ error: 'The book source is temporarily unavailable' }, { status: 502 })
  }
}
