# LIVA Voice and In-Page Translation Setup

## 1. ElevenLabs Read-Aloud (Arabic & English)

The reader sends text to `POST /api/tts`. ElevenLabs creates natural voice audio on the server, and the API key is never exposed to the browser.

### Setting up ElevenLabs in Vercel:
1. Go to your [ElevenLabs Dashboard](https://elevenlabs.io/) and copy your API key.
2. In your Vercel Project:
   - Go to **Settings → Environment Variables**.
   - Add `ELEVENLABS_API_KEY` with your key value.
   - (Optional) You can customize `ELEVENLABS_VOICE_ID`, `ELEVENLABS_ARABIC_VOICE_ID`, or `ELEVENLABS_ENGLISH_VOICE_ID`.
3. Save and redeploy.

The system also supports `TTS_API_KEY`, `XI_API_KEY`, and Google Cloud Text-to-Speech (`GOOGLE_TTS_API_KEY`). If any provider is temporarily unreachable, an automatic fallback ensures that audio reading continues to function.

## 2. In-Page Arabic-to-English Translation

When a reader clicks "ترجم إلى الإنجليزية" (Translate to English), the text is translated directly within the reader on the same page. No external redirects or Google Translate tabs are opened.

- The translation endpoint is `POST /api/library/[bookId]`.
- If Vercel AI Gateway / Gemini (`AI_GATEWAY_API_KEY`) is configured, high-quality literary translation is used.
- If AI Gateway is not configured, automatic server-side translation is used as a fallback, preserving all paragraph breaks and formatting.
- Clicking the button again toggles back to the original Arabic text instantly.
