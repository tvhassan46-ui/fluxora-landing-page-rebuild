'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

const covers = [
  { src: '/book-covers/hayy-ibn-yaqzan.png', title: 'Hayy ibn Yaqzan', href: '/novels', className: 'world-book-one' },
  { src: '/book-covers/alf-layla.png', title: 'One Thousand and One Nights', href: '/stories', className: 'world-book-two' },
  { src: '/book-covers/kalila-wa-dimna.png', title: 'Kalila and Dimna', href: '/stories', className: 'world-book-three' },
  { src: '/book-covers/risalat-al-ghufran.png', title: 'The Epistle of Forgiveness', href: '/library', className: 'world-book-four' },
]

export function ReadingWorld() {
  const { locale } = useLanguage()
  const isArabic = locale === 'ar'

  return (
    <section className="reading-world-section" id="reading-world">
      <div className="reading-world-copy">
        <span><Sparkles aria-hidden="true" /> {isArabic ? 'مساحة ثلاثية الأبعاد' : 'A dimensional reading space'}</span>
        <h2>{isArabic ? <>ادخل إلى عالم<br /><em>تعيش فيه الحكايات.</em></> : <>Step into a world<br /><em>made of stories.</em></>}</h2>
        <p>{isArabic ? 'تصفح أعمالك المفضلة في مشهد ثلاثي الأبعاد خفيف، دون محركات ألعاب أو خدمات خارجية ثقيلة.' : 'Explore timeless works in a lightweight 3D-inspired scene, without a game engine or heavy external services.'}</p>
        <div className="reading-world-actions">
          <Link href="/library">{isArabic ? 'اكتشف المكتبة' : 'Explore the library'} <ArrowUpRight aria-hidden="true" /></Link>
          <Link href="/clubs">{isArabic ? 'انضم إلى نادٍ' : 'Join a reading club'} <BookOpen aria-hidden="true" /></Link>
          <Link href="/progress">{isArabic ? 'تابع إنجازاتك' : 'Track your progress'} <Sparkles aria-hidden="true" /></Link>
          <Link href="/shelf">{isArabic ? 'رفّي الشخصي' : 'My saved shelf'} <BookOpen aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="reading-world-stage" aria-label={isArabic ? 'أغلفة كتب في مشهد ثلاثي الأبعاد' : 'Book covers in a 3D scene'}>
        <div className="world-orbit world-orbit-a" />
        <div className="world-orbit world-orbit-b" />
        <div className="world-platform"><span>LIVA · LIBRARY</span></div>
        {covers.map((cover) => (
          <Link href={cover.href} className={`world-book ${cover.className}`} key={cover.src} aria-label={cover.title}>
            <Image src={cover.src} alt={cover.title} fill sizes="(max-width: 700px) 110px, 190px" />
          </Link>
        ))}
        <span className="world-scene-label">{isArabic ? 'اكتشف · اقرأ · شارك' : 'DISCOVER · READ · SHARE'}</span>
      </div>
    </section>
  )
}
