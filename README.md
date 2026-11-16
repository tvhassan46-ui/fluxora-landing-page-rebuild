# LIVA

LIVA is a bilingual Arabic literature library built with Next.js. It includes public-domain reading, browser-native read-aloud, reader discussions, reading clubs, a personal saved shelf, local reading rewards, and classic Arabic books across literary journeys, novels, maqamat, and story collections.

## Local development

Requirements: Node.js 22 or newer and pnpm 12.3.4.

```powershell
corepack pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
corepack pnpm dev
```

Authentication and persistent discussions use PostgreSQL and Better Auth. Set `DATABASE_URL` to a PostgreSQL database and set `BETTER_AUTH_SECRET` to a unique random secret of at least 32 characters.

## No hosted AI, TTS, translation, or media tokens

- Read-aloud uses the browser's built-in Speech Synthesis API, splits long passages into smaller utterances, and chooses a voice already installed on the visitor's device. An Arabic voice must be available on that device for Arabic narration.
- Automatic chapter translation is not bundled. A reliable unlimited hosted translator is not available for free; English visitors can use their browser's page-translation feature. Curated English book and quote copy remains available.
- Chat images and audio notes are stored in the existing PostgreSQL `quote_messages.media_path` field as data URLs, not Vercel Blob. Attachments are limited to 2.5 MB. Existing attachments stored in Vercel Blob before this change are not migrated automatically.
- The reading clubs use the existing `quote_messages` table with separate room IDs.
- The catalogue includes additional Wikisource texts: *The Dove’s Neck-Ring*, *The Travels of Ibn Battuta*, the Maqamat of al-Hariri and Badi al-Zaman al-Hamadhani, *The Book of Misers*, and *The Voyages of Sinbad the Sailor*.
- Points, badges, and saved books are stored locally in the current browser. They do not sync across devices.

No AI Gateway, LiveKit, Edge TTS, Vercel Blob, or Vercel Analytics account/token is required by these features.

## Deploy with GitHub and Vercel

Connect this repository to the Vercel project and keep the detected Next.js framework settings. A push to the configured production branch triggers a production deployment when Git integration is enabled; pull requests receive preview deployments.

Set these environment variables in Vercel for each deployment environment:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `BETTER_AUTH_SECRET` | Yes | Unique random secret of at least 32 characters. |
| `BETTER_AUTH_URL` | Recommended | Canonical site origin, for example `https://your-domain.com`. |

The database provider and Vercel plan may still have storage, runtime, bandwidth, or request limits. No hosting plan can honestly be described as unlimited forever. Chat attachments use PostgreSQL storage, so keep an eye on database capacity.

## Checks

```powershell
corepack pnpm build
```
