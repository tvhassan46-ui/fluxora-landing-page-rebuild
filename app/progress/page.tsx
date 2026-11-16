import type { Metadata } from 'next'
import { ReadingProgressDashboard } from '@/components/reading-progress'

export const metadata: Metadata = { title: 'Reading Progress | LIVA', description: 'Track completed chapters, points, and reading badges.' }

export default function Page() {
  return <ReadingProgressDashboard />
}
