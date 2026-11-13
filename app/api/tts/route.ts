import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

type TtsLanguage = 'ar' | 'en'
type GoogleTtsResponse = {
  audioContent?: string
  error?: { message?: string }
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 36
const MAX_TEXT_CHARACTERS = 12000
const MAX_INPUT_BYTES_PER_REQUEST = 4400
const audioCache = new Map<string, { audio: Buffer; expiresAt: number }>()

function splitTextByByteLimit(text: string): string[] {
  const tokens = text.match(/\S+\s*|\s+/gu) ?? [text]
  const chunks: string[] = []
  let current = ''

  const pushLongTokenInPieces = (token: string) => {
    let piece = ''
    for (const character of token) {
      if (Buffer.byteLength(piece + character, 'utf8') > MAX_INPUT_BYTES_PER_REQUEST) {
        if (piece) chunks.push(piece)
        piece = character
      } else {
        piece += character
      }
    }
    if (piece) chunks.push(piece)
  }

  for (const token of tokens) {
    if (Buffer.byteLength(token, 'utf8') > MAX_INPUT_BYTES_PER_REQUEST) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      pushLongTokenInPieces(token)
      continue
    }

    if (Buffer.byteLength(current + token, 'utf8') > MAX_INPUT_BYTES_PER_REQUEST) {
      if (current) chunks.push(current)
      current = token
    } else {
      current += token
    }
  }

  if (current) chunks.push(current)
  return chunks.map((chunk) => chunk.trim()).filter(Boolean)
}

function getPcmFromWav(wav: Buffer): Buffer {
  if (wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('The speech provider returned an invalid WAV file.')
  }

  let offset = 12
  while (offset + 8 <= wav.length) {
    const chunkId = wav.toString('ascii', offset, offset + 4)
    const chunkSize = wav.readUInt32LE(offset + 4)
    const chunkStart = offset + 8
    const chunkEnd = chunkStart + chunkSize

    if (chunkEnd > wav.length) break
    if (chunkId === 'data') return wav.subarray(chunkStart, chunkEnd)

    offset = chunkEnd + (chunkSize % 2)
  }

  throw new Error('The speech provider returned WAV audio without a data section.')
}

function createWav(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44)
  const channels = 1
  const bitsPerSample = 16
  const blockAlign = channels * bitsPerSample / 8

  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * blockAlign, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)

  return Buffer.concat([header, pcm])
}

async function synthesizeChunk(text: string, language: TtsLanguage, apiKey: string): Promise<Buffer> {
  const endpoint = new URL('https://texttospeech.googleapis.com/v1/text:synthesize')
  endpoint.searchParams.set('key', apiKey)

  const isArabic = language === 'ar'
  const sampleRate = 24000
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: isArabic ? 'ar-XA' : 'en-US',
        name: isArabic ? 'ar-XA-Wavenet-B' : 'en-US-Neural2-D',
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        sampleRateHertz: sampleRate,
        speakingRate: 0.94,
        audioChannelCount: 1,
      },
    }),
    cache: 'no-store',
  })

  const result = await response.json().catch(() => null) as GoogleTtsResponse | null
  if (!response.ok || !result?.audioContent) {
    console.error('Google Cloud TTS request failed:', response.status, result?.error?.message ?? 'No audio content')
    throw new Error('Speech synthesis failed.')
  }

  return getPcmFromWav(Buffer.from(result.audioContent, 'base64'))
}

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

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Audio reading is not configured yet. The site owner must add GOOGLE_TTS_API_KEY.' },
      { status: 503 },
    )
  }

  const body = await request.json().catch(() => null) as { text?: unknown; language?: unknown } | null
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  const language = body?.language === 'en' ? 'en' : body?.language === 'ar' ? 'ar' : null

  if (!text) {
    return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
  }
  if (!language) {
    return NextResponse.json({ error: 'Choose Arabic or English audio.' }, { status: 400 })
  }
  if (text.length > MAX_TEXT_CHARACTERS) {
    return NextResponse.json({ error: 'This passage is too long to read in one request.' }, { status: 413 })
  }

  const cacheKey = createHash('sha256').update(language + '\u0000' + text).digest('hex')
  pruneAudioCache()
  const cached = audioCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return new NextResponse(new Uint8Array(cached.audio), {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(cached.audio.length),
        'Cache-Control': 'private, max-age=21600',
        'X-Audio-Cache': 'HIT',
      },
    })
  }

  try {
    const chunks = splitTextByByteLimit(text)
    const pcmChunks: Buffer[] = []

    for (const chunk of chunks) {
      pcmChunks.push(await synthesizeChunk(chunk, language, apiKey))
    }

    const sampleRate = 24000
    const audio = createWav(Buffer.concat(pcmChunks), sampleRate)
    audioCache.set(cacheKey, { audio, expiresAt: Date.now() + CACHE_TTL_MS })
    pruneAudioCache()

    return new NextResponse(new Uint8Array(audio), {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(audio.length),
        'Cache-Control': 'private, max-age=21600',
        'X-Audio-Cache': 'MISS',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Voice generation is temporarily unavailable. Please try again.' },
      { status: 502 },
    )
  }
}
