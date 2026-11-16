import type { Metadata } from 'next'
import { ReadingClubsPage } from '@/components/reading-clubs-page'

export const metadata: Metadata = { title: 'Reading Clubs | LIVA', description: 'Join a LIVA reading club and discuss Arabic classics, poetry, and short stories.' }

export default function Page() {
  return <ReadingClubsPage />
}
