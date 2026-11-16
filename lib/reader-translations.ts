export const bookTranslations: Record<string, {
  title: string
  author: string
  period: string
  genreLabel: string
  description: string
  episodes: Record<string, string>
}> = {
  'hayy-ibn-yaqzan': {
    title: 'Hayy ibn Yaqzan',
    author: 'Ibn Tufail',
    period: '6th century AH',
    genreLabel: 'Philosophical novel',
    description: 'On a remote island, Ibn Tufail follows Hayy’s awakening and his questions about humanity, nature, and knowledge.',
    episodes: { complete: 'Hayy ibn Yaqzan' },
  },
  'alf-layla': {
    title: 'One Thousand and One Nights',
    author: 'Traditional stories, author unknown',
    period: 'Classical Arabic tradition',
    genreLabel: 'Story cycle',
    description: 'Stories unfold across successive nights. Choose a tale and read it from the original text, one chapter at a time.',
    episodes: {
      'king-shahryar': 'King Shahryar and Shah Zaman',
      'donkey-and-ox': 'The Donkey, the Ox, and the Farmer',
      'merchant-and-jinni': 'The Merchant and the Jinni',
      'fisherman-and-jinni': 'The Fisherman and the Jinni',
      'king-yunan': 'King Yunan and the Sage Ruyan',
      'porter-and-girls': 'The Porter and the Three Ladies',
    },
  },
  'kalila-wa-dimna': {
    title: 'Kalila and Dimna',
    author: 'Abdullah ibn al-Muqaffa',
    period: '2nd century AH',
    genreLabel: 'Fables',
    description: 'Animal tales offer lessons in wisdom, friendship, and thoughtful leadership.',
    episodes: {
      'lion-and-ox': 'The Lion and the Ox',
      'dimna-trial': 'The Inquiry into Dimna’s Affair',
    },
  },
  'risalat-al-ghufran': {
    title: 'The Epistle of Forgiveness',
    author: 'Abu al-Ala al-Ma’arri',
    period: '5th century AH',
    genreLabel: 'Literary journey',
    description: 'A satirical imagined journey among poets, blending storytelling, language, and literary criticism.',
    episodes: {
      'first-part-1': 'Arrival of the Epistle',
      'first-part-2': 'A Blessed Tree',
      'first-part-3': 'Wine of Paradise',
      'first-part-4': 'The Faith of al-A’sha',
      'first-part-5': 'The Two Nabighas',
      'first-part-6': 'Labid',
      'first-part-7': 'Rabab',
      'first-part-8': 'Hassan ibn Thabit',
      'first-part-9': 'The Blind Poets of Qays',
      'first-part-10': 'The Poem of al-Shammakh',
      'first-part-11': 'Tamim ibn Abi',
      'first-part-12': 'Praising Ridwan',
      'first-part-13': 'Praising Zufar',
      'first-part-14': 'Hamza ibn Abd al-Muttalib',
      'first-part-15': 'The Judge of Aleppo',
      'first-part-16': 'Repentance of Ali ibn Mansur',
      'first-part-17': 'Fatima bint Muhammad',
      'first-part-18': 'Humayd ibn Thawr',
      'first-part-19': 'Jiran al-Awd',
      'first-part-20': 'The Manners of the Jinn',
      'first-part-21': 'Al-Khansa al-Sulamiyya',
      'first-part-22': 'Antarah al-Absi',
      'first-part-23': 'Amr ibn Kulthum',
      'first-part-24': 'Tarafa ibn al-Abd',
      'first-part-25': 'The Revelers',
      'first-part-26': 'Adam Spoke Arabic in Paradise',
      'first-part-27': 'Dhat al-Safa',
      'first-part-28': 'al-Ajjaj',
    },
  },
  'tawq-al-hamama': {
    title: 'The Dove’s Neck-Ring',
    author: 'Ibn Hazm al-Andalusi',
    period: '5th century AH',
    genreLabel: 'Literary treatise',
    description: 'An Andalusian work on love, its signs and experiences, blending reflection, personal narrative, and poetry.',
    episodes: {
      'letters-structure': 'Structure of the Treatise',
      union: 'Union',
      contentment: 'Contentment',
    },
  },
  'tuhfat-al-nuzzar': {
    title: 'The Travels of Ibn Battuta',
    author: 'Ibn Battuta',
    period: '8th century AH',
    genreLabel: 'Travel literature',
    description: 'Ibn Battuta’s account of his journeys from Tangier across cities and countries, recording people, places, and customs.',
    episodes: { 'first-journey': 'Volume One' },
  },
  'maqamat-hariri': {
    title: 'The Maqamat of al-Hariri',
    author: 'Al-Qasim ibn Ali al-Hariri',
    period: '6th century AH',
    genreLabel: 'Classical literary tales',
    description: 'The adventures of al-Harith ibn Hammam and Abu Zayd al-Sarouji, told through wit, travel, and eloquent prose.',
    episodes: {
      'hariri-haramiyya': 'The Haramiyya Maqama',
      'hariri-omaniyya': 'The Omani Maqama',
      'hariri-maghribiyya': 'The Maghribi Maqama',
      'hariri-makkiyya': 'The Makkiyya Maqama',
    },
  },
  'maqamat-badi': {
    title: 'The Maqamat of Badi al-Zaman al-Hamadhani',
    author: 'Badi al-Zaman al-Hamadhani',
    period: '4th century AH',
    genreLabel: 'Classical literary tales',
    description: 'The witty encounters of Abu al-Fath al-Iskandari as narrated by Isa ibn Hisham.',
    episodes: {
      'badi-saymariyya': 'The Saymariyya Maqama',
      'badi-shiraziyya': 'The Shiraziyya Maqama',
      'badi-nuhaydiyya': 'The Nuhaydiyya Maqama',
    },
  },
  'al-bukhala': {
    title: 'The Book of Misers',
    author: 'Al-Jahiz',
    period: '3rd century AH',
    genreLabel: 'Anecdotes and stories',
    description: 'Witty social sketches and anecdotes revealing human habits through the sharp observations of al-Jahiz.',
    episodes: { 'bukhala-complete': 'The Book of Misers' },
  },
  'sindbad-bahri': {
    title: 'The Voyages of Sinbad the Sailor',
    author: 'From One Thousand and One Nights',
    period: 'Classical Arabic story tradition',
    genreLabel: 'Adventure tales',
    description: 'The seven voyages of Sinbad the Sailor, across strange islands, distant seas, and wondrous creatures.',
    episodes: { 'sindbad-journeys': 'The Seven Voyages' },
  },
}

export const quoteTranslations: Record<string, { lines: string[]; author: string; work: string }> = {
  resolve: {
    lines: [
      'According to the measure of resolve come the acts of resolve,',
      'and according to the noble, come noble deeds.',
    ],
    author: 'Al-Mutanabbi',
    work: 'On Resolve and Noble Deeds',
  },
  perspective: {
    lines: [
      'Small things seem great in the eyes of the small-minded,',
      'while great things seem small to those of greatness.',
    ],
    author: 'Al-Mutanabbi',
    work: 'On Resolve and Noble Deeds',
  },
}
