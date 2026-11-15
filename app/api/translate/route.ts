import { createHash } from 'node:crypto'
import { gateway, generateText } from 'ai'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const translationCache = new Map<string, { translation: string; expiresAt: number }>()
const CACHE_TTL_MS = 6 * 60 * 60 * 1000

async function translateWithFallback(sourceText: string): Promise<string> {
  const translatedParagraphs: string[] = []
  for (const paragraph of sourceText.split(/\n{2,}/)) {
    const trimmed = paragraph.trim()
    if (!trimmed) continue
    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(trimmed)}`
    const response = await fetch(endpoint, { headers: { Accept: 'application/json', 'User-Agent': 'LIVA-Reader/1.0' }, cache: 'no-store' })
    if (!response.ok) throw new Error(`Fallback translation failed with status ${response.status}`)
    const data = (await response.json()) as unknown[]
    if (!Array.isArray(data[0])) throw new Error('Translation response had an unexpected format.')
    const translated = (data[0] as unknown[])
      .filter((chunk): chunk is [string] => Array.isArray(chunk) && typeof chunk[0] === 'string')
      .map((chunk) => chunk[0]).join('').trim()
    if (!translated) throw new Error('Translation response was empty.')
    translatedParagraphs.push(translated)
  }
  return translatedParagraphs.join('\n\n')
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { text?: unknown } | null
  const sourceText = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!sourceText) return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
  if (sourceText.length > 25000) return NextResponse.json({ error: 'Text is too long to translate.' }, { status: 413 })

  const cacheKey = createHash('sha256').update(sourceText).digest('hex')
  const cached = translationCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json({ translation: cached.translation })

  let translation = ''
  if (process.env.AI_GATEWAY_API_KEY) {
    try {
      const result = await generateText({
        model: gateway('google/gemini-3.8-flash'),
        system: 'Translate the Arabic text into faithful, natural English. Preserve paragraph breaks. Return only the translation, with no commentary.',
        prompt: sourceText,
        maxOutputTokens: 8192,
      })
      translation = result.text.trim()
    } catch (error) {
      console.warn('AI translation unavailable, using server-side fallback:', error)
    }
  }

  if (!translation) {
    try { translation = await translateWithFallback(sourceText) } catch (error) { console.error('Translation failed:', error) }
  }
  if (!translation) return NextResponse.json({ error: 'Translation is temporarily unavailable.' }, { status: 502 })

  translationCache.set(cacheKey, { translation, expiresAt: Date.now() + CACHE_TTL_MS })
  while (translationCache.size > 48) {
    const oldestKey = translationCache.keys().next().value
    if (!oldestKey) break
    translationCache.delete(oldestKey)
  }
  return NextResponse.json({ translation })
}
