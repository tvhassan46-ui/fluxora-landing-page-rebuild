import type { Metadata } from 'next'
import { CommunityPage } from '@/components/community-page'

export const metadata: Metadata = {
  title: 'Community | LIVA',
  description: 'Meet readers and share your thoughts in the LIVA community.',
}

export default function Page() {
  return <CommunityPage />
}
