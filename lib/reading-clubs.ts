export const readingClubs = [
  {
    slug: 'arabic-classics',
    chatMode: 'club-arabic-classics',
    icon: '✦',
    color: 'amber',
    en: { title: 'Arabic Classics Club', category: 'Classic literature', description: 'Read timeless Arabic works together, exchange notes, and discover new interpretations.' },
    ar: { title: 'نادي الأدب العربي', category: 'الأدب الكلاسيكي', description: 'نقرأ روائع الأدب العربي معًا، ونتبادل الملاحظات، ونكتشف معاني جديدة.' },
  },
  {
    slug: 'poetry-circle',
    chatMode: 'club-poetry-circle',
    icon: '❧',
    color: 'rose',
    en: { title: 'Poetry Circle', category: 'Poetry & verse', description: 'Share favorite lines, explore poetic meanings, and celebrate Arabic poetry.' },
    ar: { title: 'حلقة الشعر', category: 'الشعر والأبيات', description: 'شارك أبياتك المفضلة، واكتشف معاني القصائد، واحتفِ بالشعر العربي.' },
  },
  {
    slug: 'short-stories',
    chatMode: 'club-short-stories',
    icon: '◈',
    color: 'blue',
    en: { title: 'Short Story Club', category: 'Stories & discussion', description: 'Discuss characters, endings, and the ideas hidden inside short stories.' },
    ar: { title: 'نادي القصة القصيرة', category: 'القصص والنقاش', description: 'ناقش الشخصيات والنهايات والأفكار التي تحملها القصص القصيرة.' },
  },
] as const

export type ReadingClubSlug = (typeof readingClubs)[number]['slug']

export function getReadingClub(slug: string) {
  return readingClubs.find((club) => club.slug === slug)
}
