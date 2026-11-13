'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Locale = 'en' | 'ar'

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocaleState] = useState(initialLocale)

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
    document.cookie = `site_language=${nextLocale}; Path=/; Max-Age=31536000; SameSite=None; Secure`
    document.documentElement.lang = nextLocale
    document.documentElement.dir = nextLocale === 'ar' ? 'rtl' : 'ltr'
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.title = locale === 'ar'
      ? 'LIVRA — مكتبة عربية'
      : 'LIVRA — Arabic Library'
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      locale === 'ar'
        ? 'اكتشف الكتب والروايات والحكايات والاقتباسات الأدبية في مكتبة واحدة.'
        : 'Discover books, novels, stories, and literary quotes in one welcoming library.',
    )
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used within LanguageProvider')
  return value
}
