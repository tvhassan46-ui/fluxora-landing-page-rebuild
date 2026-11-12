import type { Metadata } from 'next'
import { PublicLibrary } from '@/components/public-library'

export const metadata: Metadata = {
  title: 'المكتبة المجانية | Fluxora',
  description: 'اقرأ روايات وحكايات عربية تراثية مجانًا، فصلًا بعد فصل، مع روابط للمصادر الأصلية.',
}

export default function LibraryPage() {
  return <PublicLibrary collection="all" />
}
