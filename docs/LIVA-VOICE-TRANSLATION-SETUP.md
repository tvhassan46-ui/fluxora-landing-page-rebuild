# LIVA zero-API reader setup

LIVA's reader no longer calls hosted AI, translation, or text-to-speech providers.

## Read aloud

The reader and quote cards use the browser's built-in `SpeechSynthesis` API. It does not require a provider account, API key, billing account, or per-character quota. The available voices depend on the visitor's browser and operating system; LIVA cannot install voices on a visitor's device.

## Translation

Automatic chapter translation is intentionally not provided by the app because a dependable, unlimited, hosted translation service is not available for free. The original Arabic text remains accessible, and English visitors can use their browser's built-in page-translation feature when it is available. Selected quote translations and book descriptions that are already part of the code remain available.

## Chat attachments

Chat images and audio notes are stored in the existing PostgreSQL `quote_messages.media_path` text field as data URLs. This removes the separate Vercel Blob token. Attachments are limited to 2.5 MB to keep requests within serverless request-size constraints. Database storage and provider quotas still apply.

## Required environment

Authentication and persistent community data still need `DATABASE_URL` and `BETTER_AUTH_SECRET`. These are application configuration values, not paid AI API tokens.