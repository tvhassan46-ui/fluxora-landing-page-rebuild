import type { Metadata } from 'next'
import { PublicLibrary } from '@/components/public-library'

export const metadata: Metadata = {
  title: 'Arabic Books | LIVRA',
  description: 'Explore classic Arabic literary works and journeys outside the novel and story collections.'
}

export default function LibraryPage() {
  return <PublicLibrary collection="books" />
}
