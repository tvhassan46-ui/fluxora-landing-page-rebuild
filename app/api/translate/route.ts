import { createHash } from 'node:crypto'
import { gateway, generateText } from 'ai'
import { NextResponse } from 'next/server'
import { translateArabicToEnglish } from '@/lib/translation'

export const runtime = 'nodejs'
export const maxDuration = 60

const translationCache = new Map<string, { translation: string; expiresAt: number }>()
const CACHE_TTL_MS = 6 * 60 * 60 * 1000

async function translateWithFallback(sourceText: string): Promise<string> {
  return translateArabicToEnglish(sourceText)
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
