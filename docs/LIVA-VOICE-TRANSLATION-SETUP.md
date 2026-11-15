# LIVA Voice and In-Page Translation Setup

## 1. Edge TTS Read-Aloud (Arabic & English)

The reader sends text to `POST /api/tts`. The server uses `@travisvn/edge-tts` and returns `audio/mpeg`; no API key or Vercel environment variable is required. The default Arabic voice is `ar-SA-HamedNeural`, with additional Arabic and English voices available in the reader dropdown.

The API runs on the Node.js runtime, which is compatible with Vercel serverless functions. It validates the requested language and voice, caches generated audio briefly in memory, and returns a clear error response if the Edge service is unavailable.

## 2. In-Page Arabic-to-English Translation

When a reader clicks the translation control, the text is translated directly within the reader on the same page.

- The translation endpoint is `POST /api/library/[bookId]`.
- If Vercel AI Gateway / Gemini (`AI_GATEWAY_API_KEY`) is configured, high-quality literary translation is used.
- If AI Gateway is not configured, automatic server-side translation is used as a fallback.
- Clicking the button again toggles back to the original Arabic text instantly.
