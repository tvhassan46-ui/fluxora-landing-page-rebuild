import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReadingClubsPage } from '@/components/reading-clubs-page'
import { getReadingClub } from '@/lib/reading-clubs'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const club = getReadingClub(slug)
  if (!club) return { title: 'Reading club not found | LIVA' }
  return { title: `${club.en.title} | LIVA`, description: club.en.description }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  if (!getReadingClub(slug)) notFound()
  return <ReadingClubsPage slug={slug} />
}
