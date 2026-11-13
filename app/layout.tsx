import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Amiri, Cairo, Scheherazade_New } from 'next/font/google'
import { LanguageProvider, type Locale } from '@/components/language-provider'

import './globals.css'
import './auth.css'
import './library.css'

const headingFont = Amiri({ subsets: ['arabic', 'latin'], weight: '700', variable: '--font-heading' })
const bodyFont = Scheherazade_New({ subsets: ['arabic', 'latin'], weight: '400', variable: '--font-copy' })
const buttonFont = Cairo({ subsets: ['arabic', 'latin'], weight: '600', variable: '--font-buttons' })

export const metadata: Metadata = {
  title: 'LIVRA — Arabic Library',
  description: 'LIVRA brings Arabic books, novels, short stories, and literary quotes together in one welcoming library.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/livra-logo.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FFFFFF',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const savedLocale = (await cookies()).get('site_language')?.value
  const initialLocale: Locale = savedLocale === 'ar' ? 'ar' : 'en'

  return (
    <html lang={initialLocale} dir={initialLocale === 'ar' ? 'rtl' : 'ltr'} className={`${headingFont.variable} ${bodyFont.variable} ${buttonFont.variable}`}>
      <body className="antialiased">
        <LanguageProvider initialLocale={initialLocale}>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LanguageProvider>
      </body>
    </html>
  )
}
