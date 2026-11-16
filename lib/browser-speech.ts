export type BrowserSpeechLanguage = 'ar' | 'en'

type SpeechCallbacks = {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: SpeechSynthesisErrorEvent) => void
}

/**
 * Uses speech voices already exposed by the visitor's browser/operating system.
 * No remote service, API key, usage quota, or per-character billing is involved.
 */
export function speakInBrowser(
  text: string,
  language: BrowserSpeechLanguage,
  callbacks: SpeechCallbacks = {},
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return null

  const utterance = new SpeechSynthesisUtterance(text)
  const prefix = language === 'ar' ? 'ar' : 'en'
  const voices = window.speechSynthesis.getVoices()
  const preferredVoice = voices.find((voice) => voice.lang.toLowerCase() === (language === 'ar' ? 'ar' : 'en-us'))
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix))

  utterance.lang = language === 'ar' ? 'ar' : 'en-US'
  if (preferredVoice) utterance.voice = preferredVoice
  utterance.rate = 0.94
  utterance.pitch = 1
  utterance.onstart = callbacks.onStart ?? null
  utterance.onend = callbacks.onEnd ?? null
  utterance.onerror = (event) => callbacks.onError?.(event)

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return utterance
}
