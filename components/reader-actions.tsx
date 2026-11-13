'use client'

import { useEffect } from 'react'

export function ReaderActions() {
  useEffect(() => {
    let activeAudio: HTMLAudioElement | null = null
    let activeAudioUrl: string | null = null
    let isLoadingAudio = false

    const handleReaderAction = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const button = target.closest<HTMLButtonElement>('.reader-tools button')
      if (!button) return

      const isListenButton = button.classList.contains('audio-button')
      const isTranslateButton = button.classList.contains('translation-button')
      if (!isListenButton && !isTranslateButton) return

      const readerText = button.closest('.reader-paper')?.querySelector('.reader-text')
      if (!readerText) return

      const text = Array.from(readerText.querySelectorAll('p:not(.reader-language-note)'))
        .map((paragraph) => paragraph.textContent?.trim() ?? '')
        .filter(Boolean)
        .join('\n\n')
      if (!text) return

      event.preventDefault()
      event.stopImmediatePropagation()

      if (isTranslateButton) {
        window.open(
          `https://translate.google.com/?sl=ar&tl=en&text=${encodeURIComponent(text)}`,
          '_blank',
          'noopener,noreferrer',
        )
        return
      }

      if (activeAudio && !activeAudio.paused) {
        activeAudio.pause()
        return
      }

      if (activeAudio?.paused) {
        void activeAudio.play().catch(() => {})
        return
      }

      if (isLoadingAudio) return
      isLoadingAudio = true
      button.setAttribute('aria-busy', 'true')

      void (async () => {
        try {
          const response = await fetch('/api/quotes/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          })
          if (!response.ok) return

          const blob = await response.blob()
          activeAudioUrl = URL.createObjectURL(blob)
          activeAudio = new Audio(activeAudioUrl)
          activeAudio.addEventListener('ended', () => {
            if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl)
            activeAudioUrl = null
            activeAudio = null
          }, { once: true })
          activeAudio.addEventListener('error', () => {
            if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl)
            activeAudioUrl = null
            activeAudio = null
          }, { once: true })
          await activeAudio.play()
        } catch {
          // Keep the reader interface quiet if audio generation or playback fails.
        } finally {
          isLoadingAudio = false
          button.removeAttribute('aria-busy')
        }
      })()
    }

    document.addEventListener('click', handleReaderAction, true)
    return () => {
      document.removeEventListener('click', handleReaderAction, true)
      activeAudio?.pause()
      if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl)
    }
  }, [])

  return null
}
