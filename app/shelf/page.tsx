import type { Metadata } from 'next'
import { ReadingShelf } from '@/components/book-social-actions'

export const metadata: Metadata = { title: 'My Shelf | LIVA', description: 'Save and share your favorite books.' }

export default function Page() {
  return <ReadingShelf />
}
