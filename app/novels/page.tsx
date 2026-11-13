import type { Metadata } from 'next'
import { PublicLibrary } from '@/components/public-library'

export const metadata: Metadata = {
  title: 'Arabic Novels | Riwaq',
  description: 'Explore philosophical and literary novels from the Arabic tradition, with links to original open texts.',
}

export default function NovelsPage() {
  return <PublicLibrary collection="novels" />
}
