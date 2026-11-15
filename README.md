# LIVA

LIVA is a bilingual Arabic literature library built with Next.js. The app includes book and story reading, text-to-speech, authentication, and reader discussions.

## Local development

Requirements: Node.js 22 or newer and pnpm 12.3.4.

```powershell
corepack pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
corepack pnpm dev
```

Set the values in `.env.local` before using authentication. `DATABASE_URL` must point to a PostgreSQL database with the application's schema available. `BETTER_AUTH_SECRET` must be a unique, random secret of at least 32 characters. Narration uses the free, server-side Edge TTS service and requires no API key.

## Deploy with GitHub and Vercel

The repository is connected to GitHub at `tvhassan46-ui/fluxora-landing-page-rebuild`. To enable automatic deployments, import that repository in Vercel and keep the detected Next.js framework settings. Vercel will build pushes to the production branch and create preview deployments for pull requests.

Add these values in Vercel under **Project Settings → Environment Variables** for each environment that needs them:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for the production database. |
| `BETTER_AUTH_SECRET` | Yes | Unique random secret, at least 32 characters. Do not reuse the example value. |
| `BETTER_AUTH_URL` | Recommended | Canonical app origin, such as `https://your-domain.com`; set it after adding a custom domain. |

After adding or changing environment variables, redeploy so the deployment receives them. Database schema changes must be applied to the configured PostgreSQL database before enabling authentication. GitHub Actions also runs a production build on pushes to `main` and pull requests.

## Checks

```powershell
corepack pnpm build
```
