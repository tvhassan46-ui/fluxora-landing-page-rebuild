import type { Metadata } from 'next'
import { PublicLibrary } from '@/components/public-library'

export const metadata: Metadata = {
  title: 'الروايات والحكايات | Hikaya',
  description: 'اكتشف نصوصًا روائية وحكايات عربية تراثية مجانية، واقرأ النصوص كاملة من مصادرها المفتوحة.',
}

export default function NovelsPage() {
  return <PublicLibrary collection="novels" />
}
