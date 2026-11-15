import { createHash } from 'node:crypto'
import { Communicate } from '@travisvn/edge-tts'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

type TtsLanguage = 'ar' | 'en'
type CachedAudio = { audio: Buffer; expiresAt: number }

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 48
const MAX_TEXT_CHARACTERS = 15000

export const DEFAULT_ARABIC_VOICE_ID = 'ar-SA-HamedNeural'
export const DEFAULT_ENGLISH_VOICE_ID = 'en-US-GuyNeural'

export const VOICE_PROFILE_OPTIONS = {
  ar: [
    { id: 'ar-SA-HamedNeural', label: 'Hamed', accent: 'Arabic narrator' },
    { id: 'ar-EG-SalmaNeural', label: 'Salma', accent: 'Egyptian Arabic' },
    { id: 'ar-SA-ZariyahNeural', label: 'Zariyah', accent: 'Warm Arabic voice' },
  ],
  en: [
    { id: 'en-US-GuyNeural', label: 'Guy', accent: 'Clear narrator' },
    { id: 'en-US-JennyNeural', label: 'Jenny', accent: 'Warm narrator' },
    { id: 'en-US-AriaNeural', label: 'Aria', accent: 'Expressive storyteller' },
    { id: 'en-GB-SoniaNeural', label: 'Sonia', accent: 'British narrator' },
  ],
} as const

const audioCache = new Map<string, CachedAudio>()

function pruneAudioCache() {
  const now = Date.now()
  for (const [key, entry] of audioCache) {
    if (entry.expiresAt <= now) audioCache.delete(key)
  }
  while (audioCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = audioCache.keys().next().value
    if (!oldestKey) break
    audioCache.delete(oldestKey)
  }
}

function isSupportedVoice(language: TtsLanguage, voice: string): boolean {
  return VOICE_PROFILE_OPTIONS[language].some((option) => option.id === voice)
}

async function synthesizeWithEdgeTts(text: string, voice: string): Promise<Buffer> {
  const communicate = new Communicate(text, { voice })
  const chunks: Buffer[] = []
  for await (const chunk of communicate.stream()) {
    if (chunk.type === 'audio' && chunk.data) chunks.push(chunk.data)
  }
  return Buffer.concat(chunks)
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    text?: unknown
    language?: unknown
    voiceId?: unknown
  } | null

  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  const language = body?.language === 'en' || body?.language === 'ar' ? body.language : null
  const requestedVoice = typeof body?.voiceId === 'string' ? body.voiceId.trim() : ''

  if (!text) return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
  if (!language) return NextResponse.json({ error: 'Choose Arabic or English audio.' }, { status: 400 })
  if (text.length > MAX_TEXT_CHARACTERS) {
    return NextResponse.json({ error: 'This passage is too long to read in one request.' }, { status: 413 })
  }

  const defaultVoice = language === 'ar' ? DEFAULT_ARABIC_VOICE_ID : DEFAULT_ENGLISH_VOICE_ID
  const voice = requestedVoice || defaultVoice
  if (!isSupportedVoice(language, voice)) {
    return NextResponse.json({ error: 'The selected voice is not available for this language.' }, { status: 400 })
  }

  const cacheKey = createHash('sha256').update(`${language}\0${voice}\0${text}`).digest('hex')
  pruneAudioCache()
  const cached = audioCache.get(cacheKey)
  const baseHeaders = {
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'private, max-age=21600',
    'X-TTS-Provider': 'edge-tts',
    'X-TTS-Voice': voice,
  }

  if (cached && cached.expiresAt > Date.now()) {
    return new NextResponse(new Uint8Array(cached.audio), {
      headers: { ...baseHeaders, 'Content-Length': String(cached.audio.length), 'X-Audio-Cache': 'HIT' },
    })
  }

  try {
    const audio = await synthesizeWithEdgeTts(text, voice)
    if (!audio.length) throw new Error('No audio was returned by Edge TTS.')
    audioCache.set(cacheKey, { audio, expiresAt: Date.now() + CACHE_TTL_MS })
    pruneAudioCache()
    return new NextResponse(new Uint8Array(audio), {
      headers: { ...baseHeaders, 'Content-Length': String(audio.length), 'X-Audio-Cache': 'MISS' },
    })
  } catch (error) {
    console.error('Edge TTS synthesis failed:', error)
    return NextResponse.json({ error: 'Voice generation is temporarily unavailable. Please try again.' }, { status: 502 })
  }
}
