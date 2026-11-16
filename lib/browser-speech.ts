export type BrowserSpeechLanguage = 'ar' | 'en'

type SpeechCallbacks = {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: SpeechSynthesisErrorEvent) => void
}

function splitForSpeech(text: string, maxLength = 180): string[] {
  const normalized = text.replace(/[\u200b\u200e\u200f]/g, '').replace(/\s+/g, ' ').trim()
  if (!normalized) return []

  const chunks: string[] = []
  let current = ''

  for (const word of normalized.split(' ')) {
    if (word.length > maxLength) {
      if (current) chunks.push(current)
      current = ''
      for (let offset = 0; offset < word.length; offset += maxLength) {
        chunks.push(word.slice(offset, offset + maxLength))
      }
      continue
    }

    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxLength && current) {
      chunks.push(current)
      current = word
    } else {
      current = candidate
    }
  }

  if (current) chunks.push(current)
  return chunks
}

/**
 * Uses speech voices already exposed by the visitor's browser/operating system.
 * Long passages are split into short utterances to avoid browser speech limits.
 * No remote service, API key, account, usage quota, or per-character billing is involved.
 */
export function speakInBrowser(
  text: string,
  language: BrowserSpeechLanguage,
  callbacks: SpeechCallbacks = {},
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return null

  const chunks = splitForSpeech(text)
  if (!chunks.length) return null

  const synthesis = window.speechSynthesis
  const voices = synthesis.getVoices()
  const prefix = language === 'ar' ? 'ar' : 'en'
  const preferredVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix))

  let completedChunks = 0
  let started = false
  let failed = false

  const utterances = chunks.map((chunk) => {
    const utterance = new SpeechSynthesisUtterance(chunk)
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US'
    if (preferredVoice) utterance.voice = preferredVoice
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      if (!started) {
        started = true
        callbacks.onStart?.()
      }
    }
    utterance.onend = () => {
      completedChunks += 1
      if (completedChunks === chunks.length && !failed) callbacks.onEnd?.()
    }
    utterance.onerror = (event) => {
      if (event.error === 'canceled' || event.error === 'interrupted' || failed) return
      failed = true
      callbacks.onError?.(event)
    }

    return utterance
  })

  synthesis.cancel()
  for (const utterance of utterances) synthesis.speak(utterance)
  return utterances[0] ?? null
}
