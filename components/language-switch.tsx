'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage()
  const nextLocale = locale === 'en' ? 'ar' : 'en'

  return (
    <button
      type="button"
      className={`language-switch ${className}`.trim()}
      onClick={() => setLocale(nextLocale)}
      aria-label={locale === 'en' ? 'Switch language to Arabic' : 'تغيير اللغة إلى الإنجليزية'}
      title={locale === 'en' ? 'Switch language to Arabic' : 'تغيير اللغة إلى الإنجليزية'}
    >
      <Languages aria-hidden="true" />
    </button>
  )
}
