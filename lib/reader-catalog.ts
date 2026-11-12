export type ReaderEpisode = {
  id: string
  title: string
  pageId?: number
  section?: number
}

export type PublicBook = {
  id: string
  title: string
  author: string
  period: string
  genre: 'novel' | 'story-collection' | 'fables' | 'literary-journey'
  genreLabel: string
  description: string
  pageId?: number
  sourceTitle: string
  sourceUrl: string
  episodes: ReaderEpisode[]
}

export const publicBooks: PublicBook[] = [
  {
    id: 'hayy-ibn-yaqzan',
    title: 'حي بن يقظان',
    author: 'ابن طفيل',
    period: 'القرن السادس الهجري',
    genre: 'novel',
    genreLabel: 'رواية فلسفية',
    description: 'رحلة فكرية على جزيرة نائية، يتتبع فيها ابن طفيل نشأة حي وأسئلته عن الإنسان والطبيعة والمعرفة.',
    pageId: 1987,
    sourceTitle: 'حي بن يقظان',
    sourceUrl: 'https://ar.wikisource.org/wiki/حي_بن_يقظان',
    episodes: [{ id: 'complete', title: 'النص الكامل' }],
  },
  {
    id: 'alf-layla',
    title: 'ألف ليلة وليلة',
    author: 'حكايات تراثية مجهولة المؤلف',
    period: 'تراث عربي قديم',
    genre: 'story-collection',
    genreLabel: 'حكايات متسلسلة',
    description: 'حكايات تُروى على ليالٍ متتابعة؛ اختر حكاية واقرأ نصها كما ورد في النسخة التراثية.',
    pageId: 1607,
    sourceTitle: 'ألف ليلة وليلة / الجزء الأول',
    sourceUrl: 'https://ar.wikisource.org/wiki/ألف_ليلة_وليلة/الجزء_الأول',
    episodes: [
      { id: 'merchant-and-jinni', title: 'حكاية التاجر مع العفريت', section: 3 },
      { id: 'fisherman-and-jinni', title: 'حكاية الصياد مع العفريت', section: 4 },
    ],
  },
  {
    id: 'kalila-wa-dimna',
    title: 'كليلة ودمنة',
    author: 'عبد الله بن المقفع',
    period: 'القرن الثاني الهجري',
    genre: 'fables',
    genreLabel: 'حكايات رمزية',
    description: 'حكايات على ألسنة الحيوان تحمل دروسًا في الحكمة والصداقة وحسن التدبير.',
    sourceTitle: 'كليلة ودمنة',
    sourceUrl: 'https://ar.wikisource.org/wiki/كليلة_ودمنة',
    episodes: [
      { id: 'lion-and-ox', title: 'باب الأسد والثور وهو أول الكتاب', pageId: 6389 },
      { id: 'dimna-trial', title: 'باب الفحص عن أمر دمنة', pageId: 6390 },
    ],
  },
  {
    id: 'risalat-al-ghufran',
    title: 'رسالة الغفران',
    author: 'أبو العلاء المعري',
    period: 'القرن الخامس الهجري',
    genre: 'literary-journey',
    genreLabel: 'رحلة أدبية',
    description: 'رحلة تخييلية ساخرة في عالم الشعراء، تجمع بين الحكاية واللغة والنقد الأدبي.',
    pageId: 45783,
    sourceTitle: 'رسالة الغفران / الجزء الأول',
    sourceUrl: 'https://ar.wikisource.org/wiki/رسالة_الغفران/الجزء_الأول',
    episodes: [{ id: 'first-part', title: 'الجزء الأول' }],
  },
]

export type PublicQuote = {
  id: string
  lines: string[]
  author: string
  work: string
  sourceUrl: string
}

export const publicQuotes: PublicQuote[] = [
  {
    id: 'resolve',
    lines: ['على قدر أهل العزم تأتي العزائم', 'وتأتي على قدر الكرام المكارم'],
    author: 'المتنبي',
    work: 'على قدر أهل العزم تأتي العزائم',
    sourceUrl: 'https://ar.wikisource.org/wiki/على_قدر_أهل_العزم_تأتي_العزائم',
  },
  {
    id: 'perspective',
    lines: ['وتعظم في عين الصغير صغارها', 'وتصغر في عين العظيم العظائم'],
    author: 'المتنبي',
    work: 'على قدر أهل العزم تأتي العزائم',
    sourceUrl: 'https://ar.wikisource.org/wiki/على_قدر_أهل_العزم_تأتي_العزائم',
  },
]
