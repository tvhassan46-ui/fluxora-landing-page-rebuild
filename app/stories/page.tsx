import type { Metadata } from 'next'
import { PublicLibrary } from '@/components/public-library'

export const metadata: Metadata = {
  title: 'Arabic Stories & Fables | LIVRA',
  description: 'Read traditional story cycles, folk tales, and fables from the Arabic tradition.',
}

export default function StoriesPage() {
  return <PublicLibrary collection="stories" />
}
