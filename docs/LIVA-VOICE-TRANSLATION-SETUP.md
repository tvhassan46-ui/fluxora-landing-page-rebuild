# LIVA voice and translation setup

## 1. Arabic and English read-aloud

The reader sends text to the server route `POST /api/tts`. Google Cloud Text-to-Speech creates the audio on the server; the API key is never sent to the browser.

1. Open Google Cloud Console and select or create a project.
2. Enable **Cloud Text-to-Speech API** for that project.
3. Create an API key in **APIs & Services → Credentials**. Restrict the key to the Cloud Text-to-Speech API.
4. Add the key as `TTS_API_KEY` in Vercel → Project → Settings → Environment Variables.
5. Redeploy after saving the variable.

The reader uses an Arabic `ar-XA` WaveNet voice for the original text. When an English translation is active, it reads the translated English text with an English Neural2 voice. Long passages are split under the provider's 5,000-byte input limit and joined into one WAV response. Generated audio is cached in memory for repeat requests.

Do not name this variable `NEXT_PUBLIC_TTS_API_KEY`: it must remain server-side.

## 2. Arabic-to-English translation

Translation uses the Vercel AI Gateway with the stable Google Gemini 3.8 Flash model.

- In a Vercel deployment, AI Gateway can authenticate model calls through Vercel OIDC.
- For local development or a non-Vercel host, create an AI Gateway key and set `AI_GATEWAY_API_KEY` in `.env.local` or the hosting provider's server environment.
- Never use a `NEXT_PUBLIC_` prefix for this key.

The translation endpoint is the existing `POST /api/library/[bookId]` route. It keeps paragraph breaks and caches generated translations in memory.

## 3. Local setup

Copy `.env.example` to `.env.local`, fill in the keys, and restart the development server.

The API keys are not stored in the repository. Add the same variables in Vercel for each environment (Preview and Production) where you want the features enabled.
