import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

type TtsLanguage = 'ar' | 'en'

type CachedAudio = {
  audio: Buffer
  contentType: string
  provider: string
  expiresAt: number
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 48
const MAX_TEXT_CHARACTERS = 15000
const audioCache = new Map<string, CachedAudio>()

export const DEFAULT_ARABIC_VOICE_ID = 'Ix8C14HEHgIQkJswik2o'
export const DEFAULT_ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

const VOICE_PROFILE_OPTIONS = {
  arabic: [
    { id: 'Ix8C14HEHgIQkJswik2o', label: 'Arabic narrator' },
    { id: '7L26n1R4Wk5rT8QJk0TQ', label: 'Warm Arabic storyteller' },
  ],
  english: [
    { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel' },
    { id: 'pNInz6obpgDQGcFmaJgB', label: 'Adam' },
    { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Bella' },
  ],
} as const

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

function splitTextIntoSentences(text: string, maxChunkLength = 1200): string[] {
  const sentences = text.match(/[^.!?،؛؟\n]+[.!?،؛؟\n]*/g) ?? [text]
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChunkLength) {
      if (current.trim()) chunks.push(current.trim())
      if (sentence.length > maxChunkLength) {
        const words = sentence.split(/\s+/)
        let wordChunk = ''
        for (const word of words) {
          if ((wordChunk + ' ' + word).length > maxChunkLength) {
            if (wordChunk.trim()) chunks.push(wordChunk.trim())
            wordChunk = word
          } else {
            wordChunk = wordChunk ? `${wordChunk} ${word}` : word
          }
        }
        if (wordChunk.trim()) current = wordChunk
        else current = ''
      } else {
        current = sentence
      }
    } else {
      current += sentence
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks.length ? chunks : [text]
}

async function synthesizeElevenLabsWithVoice(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<Buffer> {
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2'
  const chunks = splitTextIntoSentences(text, 900)
  const audioBuffers: Buffer[] = []

  for (const chunk of chunks) {
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey.trim(),
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: chunk,
        model_id: modelId,
        voice_settings: {
          stability: 0.42,
          similarity_boost: 0.82,
          style: 0.55,
          use_speaker_boost: true,
        },
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`[${response.status}] ${errText || response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    audioBuffers.push(Buffer.from(arrayBuffer))
  }

  return Buffer.concat(audioBuffers)
}

async function synthesizeGoogleCloudTts(text: string, language: TtsLanguage, apiKey: string): Promise<Buffer> {
  const endpoint = new URL('https://texttospeech.googleapis.com/v1/text:synthesize')
  endpoint.searchParams.set('key', apiKey.trim())

  const isArabic = language === 'ar'
  const chunks = splitTextIntoSentences(text, 1500)
  const audioBuffers: Buffer[] = []

  for (const chunk of chunks) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        input: { text: chunk },
        voice: {
          languageCode: isArabic ? 'ar-XA' : 'en-US',
          name: isArabic ? 'ar-XA-Wavenet-B' : 'en-US-Neural2-D',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.94,
        },
      }),
      cache: 'no-store',
    })

    const result = (await response.json().catch(() => null)) as {
      audioContent?: string
      error?: { message?: string }
    } | null
    if (!response.ok || !result?.audioContent) {
      throw new Error('Google Cloud TTS synthesis failed.')
    }

    audioBuffers.push(Buffer.from(result.audioContent, 'base64'))
  }

  return Buffer.concat(audioBuffers)
}

async function synthesizeFallback(text: string, language: TtsLanguage): Promise<Buffer> {
  const chunks = splitTextIntoSentences(text, 180)
  const audioBuffers: Buffer[] = []

  for (const chunk of chunks) {
    const endpoint = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${language}&q=${encodeURIComponent(chunk)}`
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Fallback TTS error [${response.status}]`)
    }

    const arrayBuffer = await response.arrayBuffer()
    audioBuffers.push(Buffer.from(arrayBuffer))
  }

  return Buffer.concat(audioBuffers)
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    text?: unknown
    language?: unknown
    voiceId?: unknown
  } | null

  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  const language = body?.language === 'en' ? 'en' : body?.language === 'ar' ? 'ar' : null
  const requestedVoiceId = typeof body?.voiceId === 'string' && body.voiceId.trim() ? body.voiceId.trim() : null

  if (!text) {
    return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
  }
  if (!language) {
    return NextResponse.json({ error: 'Choose Arabic or English audio.' }, { status: 400 })
  }
  if (text.length > MAX_TEXT_CHARACTERS) {
    return NextResponse.json({ error: 'This passage is too long to read in one request.' }, { status: 413 })
  }

  const selectedVoiceId = requestedVoiceId || (language === 'ar' ? DEFAULT_ARABIC_VOICE_ID : DEFAULT_ELEVENLABS_VOICE_ID)

  // Candidate ElevenLabs keys in order of precedence
  const rawCandidateKeys = [
    process.env.ELEVENLABS_API_KEY,
    process.env.ELEVEN_LABS_API_KEY,
    process.env.XI_API_KEY,
    process.env.TTS_API_KEY && !process.env.TTS_API_KEY.startsWith('AIza') ? process.env.TTS_API_KEY : undefined,
  ]
  const candidateKeys = Array.from(new Set(rawCandidateKeys.filter((k): k is string => Boolean(k && k.trim()))))

  const googleTtsKey =
    process.env.GOOGLE_TTS_API_KEY ||
    (process.env.TTS_API_KEY?.startsWith('AIza') ? process.env.TTS_API_KEY : undefined)

  const cacheKey = createHash('sha256').update(`${language}\0${selectedVoiceId}\0${text}`).digest('hex')
  pruneAudioCache()
  const cached = audioCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    if (candidateKeys.length === 0 || cached.provider === 'elevenlabs') {
      return new NextResponse(new Uint8Array(cached.audio), {
        headers: {
          'Content-Type': cached.contentType,
          'Content-Length': String(cached.audio.length),
          'Cache-Control': 'private, max-age=21600',
          'X-Audio-Cache': 'HIT',
          'X-TTS-Provider': cached.provider,
          'X-TTS-Voice': selectedVoiceId,
        },
      })
    }
  }

  let audioBuffer: Buffer | null = null
  let provider = 'fallback'
  let lastElevenLabsError = ''
  const contentType = 'audio/mpeg'

  // 1. Try ElevenLabs API with candidate keys
  for (const apiKey of candidateKeys) {
    try {
      // First try the requested voice
      audioBuffer = await synthesizeElevenLabsWithVoice(text, selectedVoiceId, apiKey)
      provider = 'elevenlabs'
      break
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.warn(`ElevenLabs with voice [${selectedVoiceId}] failed:`, errMsg)
      lastElevenLabsError = errMsg

      // If voice was not found (400 or 404), try fallback to default ElevenLabs voice with same key
      if ((errMsg.includes('400') || errMsg.includes('404') || errMsg.includes('voice_not_found')) && selectedVoiceId !== DEFAULT_ELEVENLABS_VOICE_ID) {
        try {
          audioBuffer = await synthesizeElevenLabsWithVoice(text, DEFAULT_ELEVENLABS_VOICE_ID, apiKey)
          provider = 'elevenlabs'
          break
        } catch (innerErr) {
          console.warn(`ElevenLabs default voice also failed:`, innerErr)
        }
      }
    }
  }

  // 2. Try Google Cloud TTS if ElevenLabs wasn't configured or failed
  if (!audioBuffer && googleTtsKey) {
    try {
      audioBuffer = await synthesizeGoogleCloudTts(text, language, googleTtsKey)
      provider = 'google-cloud'
    } catch (error) {
      console.warn('Google Cloud TTS synthesis failed:', error)
    }
  }

  // 3. Fallback TTS if no keys or provider APIs failed
  if (!audioBuffer) {
    try {
      audioBuffer = await synthesizeFallback(text, language)
      provider = 'fallback'
    } catch (error) {
      console.error('All TTS services failed:', error)
    }
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    return NextResponse.json(
      { error: 'Voice generation is temporarily unavailable. Please try again.' },
      { status: 502 },
    )
  }

  audioCache.set(cacheKey, { audio: audioBuffer, contentType, provider, expiresAt: Date.now() + CACHE_TTL_MS })
  pruneAudioCache()

  const responseHeaders: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Length': String(audioBuffer.length),
    'Cache-Control': 'private, max-age=21600',
    'X-Audio-Cache': 'MISS',
    'X-TTS-Provider': provider,
    'X-TTS-Voice': selectedVoiceId,
  }

  if (lastElevenLabsError && provider !== 'elevenlabs') {
    responseHeaders['X-TTS-Notice'] = encodeURIComponent(lastElevenLabsError.slice(0, 160))
  }

  return new NextResponse(new Uint8Array(audioBuffer), {
    headers: responseHeaders,
  })
}
