import type { Metadata } from 'next'
import { QuoteLibrary } from '@/components/quote-library'

export const metadata: Metadata = {
  title: 'Quotes | LIVRA',
  description: 'Selected Arabic poetry and quotations linked to their original sources.',
}

export default function QuotesPage() {
  return <QuoteLibrary />
}
