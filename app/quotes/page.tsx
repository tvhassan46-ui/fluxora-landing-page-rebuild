import type { Metadata } from 'next'
import { QuoteLibrary } from '@/components/quote-library'

export const metadata: Metadata = {
  title: 'اقتباسات عربية | Hikaya',
  description: 'أبيات مختارة من الشعر العربي مع نسبتها إلى مصادرها الأصلية.',
}

export default function QuotesPage() {
  return <QuoteLibrary />
}
