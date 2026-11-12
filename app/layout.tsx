import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Noto_Sans_Arabic } from 'next/font/google'
import { LanguageProvider, type Locale } from '@/components/language-provider'

const arabicFont = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--font-arabic' })
import './globals.css'
import './auth.css'
import './library.css'

export const metadata: Metadata = {
  title: 'Hikaya — Books, Novels & Literary Quotes',
  description: 'Discover Arabic books, novels, short stories, and literary quotes in one welcoming library.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#120400',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const savedLocale = (await cookies()).get('site_language')?.value
  const initialLocale: Locale = savedLocale === 'ar' ? 'ar' : 'en'

  return (
    <html lang={initialLocale} dir={initialLocale === 'ar' ? 'rtl' : 'ltr'} className={arabicFont.variable}>
      <body className="antialiased">
        <LanguageProvider initialLocale={initialLocale}>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LanguageProvider>
      </body>
    </html>
  )
}
