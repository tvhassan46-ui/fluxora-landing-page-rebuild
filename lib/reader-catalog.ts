export type ReaderEpisode = {
  id: string
  title: string
  pageId?: number
  section?: number
  pageTitle?: string
}

export type PublicBook = {
  id: string
  title: string
  author: string
  period: string
  genre: 'novel' | 'story-collection' | 'fables' | 'literary-journey'
  genreLabel: string
  description: string
  coverImage: string
  pageId?: number
  pageTitle?: string
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
    coverImage: '/book-covers/hayy-ibn-yaqzan.png',
    pageId: 1987,
    sourceTitle: 'حي بن يقظان',
    sourceUrl: 'https://ar.wikisource.org/wiki/حي_بن_يقظان',
    episodes: [{ id: 'complete', title: 'حي بن يقظان' }],
  },
  {
    id: 'alf-layla',
    title: 'ألف ليلة وليلة',
    author: 'حكايات تراثية مجهولة المؤلف',
    period: 'تراث عربي قديم',
    genre: 'story-collection',
    genreLabel: 'حكايات متسلسلة',
    description: 'حكايات تُروى على ليالٍ متتابعة؛ اختر حكاية واقرأها من النسخة التراثية فصلًا بعد فصل.',
    coverImage: '/book-covers/alf-layla.png',
    pageId: 1607,
    sourceTitle: 'ألف ليلة وليلة / الجزء الأول',
    sourceUrl: 'https://ar.wikisource.org/wiki/ألف_ليلة_وليلة/الجزء_الأول',
    episodes: [
      { id: 'king-shahryar', title: 'حكايات الملك شهريار وأخيه الملك شاه زمان', section: 1 },
      { id: 'donkey-and-ox', title: 'حكاية الحمار والثور مع صاحب الزرع', section: 2 },
      { id: 'merchant-and-jinni', title: 'حكاية التاجر مع العفريت', section: 3 },
      { id: 'fisherman-and-jinni', title: 'حكاية الصياد مع العفريت', section: 4 },
      { id: 'king-yunan', title: 'حكاية الملك يونان والحكيم رويان', section: 5 },
      { id: 'porter-and-girls', title: 'حكاية الحمال مع البنات', section: 6 },
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
    coverImage: '/book-covers/kalila-wa-dimna.png',
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
    coverImage: '/book-covers/risalat-al-ghufran.png',
    pageId: 45783,
    sourceTitle: 'رسالة الغفران / الجزء الأول',
    sourceUrl: 'https://ar.wikisource.org/wiki/رسالة_الغفران/الجزء_الأول',
    episodes: [
      { id: 'first-part-1', title: 'وصول الرسالة', section: 1 },
      { id: 'first-part-2', title: 'شجرة طيبة', section: 2 },
      { id: 'first-part-3', title: 'خمر الجنة', section: 3 },
      { id: 'first-part-4', title: 'إيمان الأعشى', section: 4 },
      { id: 'first-part-5', title: 'النابغتان', section: 5 },
      { id: 'first-part-6', title: 'لبيد', section: 6 },
      { id: 'first-part-7', title: 'رباب', section: 7 },
      { id: 'first-part-8', title: 'حسان بن ثابت', section: 8 },
      { id: 'first-part-9', title: 'عوران قيس', section: 9 },
      { id: 'first-part-10', title: 'قصيدة الشماخ', section: 10 },
      { id: 'first-part-11', title: 'تميم بن أبي', section: 11 },
      { id: 'first-part-12', title: 'مدح رضوان', section: 12 },
      { id: 'first-part-13', title: 'مدح زفر', section: 13 },
      { id: 'first-part-14', title: 'حمزة بن عبد المطلب', section: 14 },
      { id: 'first-part-15', title: 'قاضي حلب', section: 15 },
      { id: 'first-part-16', title: 'توبة علي بن منصور', section: 16 },
      { id: 'first-part-17', title: 'فاطمة بنت محمد', section: 17 },
      { id: 'first-part-18', title: 'حميد بن ثور', section: 18 },
      { id: 'first-part-19', title: 'جران العود', section: 19 },
      { id: 'first-part-20', title: 'آداب الجن', section: 20 },
      { id: 'first-part-21', title: 'الخنساء السلمية', section: 21 },
      { id: 'first-part-22', title: 'عنترة العبسي', section: 22 },
      { id: 'first-part-23', title: 'عمرو بن كلثوم', section: 23 },
      { id: 'first-part-24', title: 'طرفة بن العبد', section: 24 },
      { id: 'first-part-25', title: 'الندامى', section: 25 },
      { id: 'first-part-26', title: 'آدم كان ينطق العربية في الجنة', section: 26 },
      { id: 'first-part-27', title: 'ذات الصفا', section: 27 },
      { id: 'first-part-28', title: 'العجّاج', section: 28 },
    ],
  },
  {
    id: 'tawq-al-hamama',
    title: 'طوق الحمامة',
    author: 'ابن حزم الأندلسي',
    period: 'القرن الخامس الهجري',
    genre: 'literary-journey',
    genreLabel: 'رسالة أدبية',
    description: 'رسالة أندلسية رفيعة في الحب وأحواله وعلاماته، تمزج التأمل الإنساني بالسرد والشعر.',
    coverImage: '/book-covers/tawq-al-hamama.svg',
    pageTitle: 'طوق الحمامة',
    sourceTitle: 'طوق الحمامة',
    sourceUrl: 'https://ar.wikisource.org/wiki/طوق_الحمامة',
    episodes: [
      { id: 'letters-structure', title: 'تقسيم الرسالة', pageTitle: 'طوق الحمامة/تقسيم الرسالة' },
      { id: 'union', title: 'الوصل', pageTitle: 'طوق الحمامة/الوصل' },
      { id: 'contentment', title: 'القنوع', pageTitle: 'طوق الحمامة/القنوع' },
    ],
  },
  {
    id: 'tuhfat-al-nuzzar',
    title: 'تحفة النظار في غرائب الأمصار وعجائب الأسفار',
    author: 'ابن بطوطة',
    period: 'القرن الثامن الهجري',
    genre: 'literary-journey',
    genreLabel: 'رحلة جغرافية',
    description: 'رحلة ابن بطوطة من طنجة عبر البلدان والمدن، وما سجّله من مشاهد وعادات وأخبار.',
    coverImage: '/book-covers/tuhfat-al-nuzzar.svg',
    pageTitle: 'تحفة النظار في غرائب الأمصار وعجائب الأسفار/الجزء الأول',
    sourceTitle: 'تحفة النظار في غرائب الأمصار وعجائب الأسفار / الجزء الأول',
    sourceUrl: 'https://ar.wikisource.org/wiki/تحفة_النظار_في_غرائب_الأمصار_وعجائب_الأسفار/الجزء_الأول',
    episodes: [{ id: 'first-journey', title: 'الجزء الأول' }],
  },
  {
    id: 'maqamat-hariri',
    title: 'مقامات الحريري',
    author: 'القاسم بن علي الحريري',
    period: 'القرن السادس الهجري',
    genre: 'novel',
    genreLabel: 'مقامات قصصية',
    description: 'حكايات الحارث بن همّام وأبي زيد السروجي، في أسفار ومواقف تجمع السرد والبلاغة والطرافة.',
    coverImage: '/book-covers/maqamat-hariri.svg',
    pageTitle: 'مقامات الحريري',
    sourceTitle: 'مقامات الحريري',
    sourceUrl: 'https://ar.wikisource.org/wiki/مقامات_الحريري',
    episodes: [
      { id: 'hariri-haramiyya', title: 'المقامة الحرامية', pageTitle: 'مقامات الحريري/المقامة الحرامية' },
      { id: 'hariri-omaniyya', title: 'المقامة العمانية', pageTitle: 'مقامات الحريري/المقامة العمانية' },
      { id: 'hariri-maghribiyya', title: 'المقامة المغربية', pageTitle: 'مقامات الحريري/المقامة المغربية' },
      { id: 'hariri-makkiyya', title: 'المقامة المكية', pageTitle: 'مقامات الحريري/المقامة المكية' },
    ],
  },
  {
    id: 'maqamat-badi',
    title: 'مقامات بديع الزمان الهمذاني',
    author: 'بديع الزمان الهمذاني',
    period: 'القرن الرابع الهجري',
    genre: 'novel',
    genreLabel: 'مقامات أدبية',
    description: 'مواقف أبي الفتح الإسكندري كما يرويها عيسى بن هشام، بلغة عربية نابضة بالمفارقة والذكاء.',
    coverImage: '/book-covers/maqamat-badi.svg',
    pageTitle: 'بديع الزمان الهمذاني',
    sourceTitle: 'مقامات بديع الزمان الهمذاني',
    sourceUrl: 'https://ar.wikisource.org/wiki/بديع_الزمان_الهمذاني',
    episodes: [
      { id: 'badi-saymariyya', title: 'المقامة الصيمرية', pageTitle: 'مقامات بديع الزمان الهمذاني/المقامة الصيمرية' },
      { id: 'badi-shiraziyya', title: 'المقامة الشيرازية', pageTitle: 'مقامات بديع الزمان الهمذاني/المقامة الشيرازية' },
      { id: 'badi-nuhaydiyya', title: 'المقامة النهيدية', pageTitle: 'مقامات بديع الزمان الهمذاني/المقامة النهيدية' },
    ],
  },
  {
    id: 'al-bukhala',
    title: 'البخلاء',
    author: 'أبو عثمان الجاحظ',
    period: 'القرن الثالث الهجري',
    genre: 'story-collection',
    genreLabel: 'نوادر وحكايات',
    description: 'مشاهد اجتماعية ساخرة ونوادر تكشف طبائع الناس وعاداتهم بأسلوب الجاحظ الذكي.',
    coverImage: '/book-covers/al-bukhala.svg',
    pageTitle: 'البخلاء',
    sourceTitle: 'البخلاء',
    sourceUrl: 'https://ar.wikisource.org/wiki/البخلاء',
    episodes: [{ id: 'bukhala-complete', title: 'البخلاء' }],
  },
  {
    id: 'sindbad-bahri',
    title: 'السندباد البحري',
    author: 'من حكايات ألف ليلة وليلة',
    period: 'التراث القصصي العربي',
    genre: 'story-collection',
    genreLabel: 'رحلات ومغامرات',
    description: 'الرحلات السبع للسندباد البحري، بين الجزر الغريبة والبحار والمخلوقات العجيبة.',
    coverImage: '/book-covers/sindbad.svg',
    pageTitle: 'ألف ليلة وليلة/السندباد البحري',
    sourceTitle: 'ألف ليلة وليلة / السندباد البحري',
    sourceUrl: 'https://ar.wikisource.org/wiki/ألف_ليلة_وليلة/السندباد_البحري',
    episodes: [{ id: 'sindbad-journeys', title: 'الرحلات السبع' }],
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
