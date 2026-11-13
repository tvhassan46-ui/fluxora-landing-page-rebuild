import type { Locale } from '@/components/language-provider'

const copy = {
  en: {
    home: 'Home',
    nav: { books: 'Books', novels: 'Novels', stories: 'Stories', quotes: 'Quotes', aria: 'Library navigation' },
    eyebrow: 'From the notebooks of Arabic poetry',
    title: ['Words that stay', 'after the conversation.'],
    description: 'Selected lines from a poem by Al-Mutanabbi, linked directly to the original text.',
    gridLabel: 'Selected lines by Al-Mutanabbi',
    copied: 'Quote copied',
    copy: 'Copy quote',
    source: 'View the original poem',
    footer: 'A line of poetry lives on whenever it finds a reader.',
    discoverBooks: 'Explore books',
  },
  ar: {
    home: 'الرئيسية',
    nav: { books: 'الكتب', novels: 'الروايات', stories: 'الحكايات', quotes: 'الاقتباسات', aria: 'التنقل بين صفحات المكتبة' },
    eyebrow: 'من دفاتر الشعر العربي',
    title: ['كلمات تبقى', 'بعد أن ينتهي الكلام.'],
    description: 'أبيات مختارة من قصيدة للمتنبي، مع إحالة مباشرة إلى النص الأصلي.',
    gridLabel: 'اقتباسات المتنبي المختارة',
    copied: 'نُسخ الاقتباس',
    copy: 'انسخ الاقتباس',
    source: 'عرض القصيدة الأصلية',
    footer: 'البيت الشعري يعيش كلما وجد قارئًا.',
    discoverBooks: 'اكتشف الكتب',
  },
} as const

export function getQuotesCopy(locale: Locale) {
  return copy[locale]
}
