import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Manrope, Noto_Sans_Arabic } from 'next/font/google'
import { LanguageProvider, type Locale } from '@/components/language-provider'

const manropeFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-manrope' })
const arabicFont = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--font-arabic' })
import './globals.css'
import './auth.css'
import './library.css'

export const metadata: Metadata = {
  title: 'LIVA — Arabic Reading Library',
  description: 'LIVA — discover Arabic books, novels, short stories, and literary quotes in one beautiful reading space.',
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
    <html lang={initialLocale} dir={initialLocale === 'ar' ? 'rtl' : 'ltr'} className={`${arabicFont.variable} ${manropeFont.variable}`}>
      <body className="antialiased">
        <LanguageProvider initialLocale={initialLocale}>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LanguageProvider>
      </body>
    </html>
  )
}
