import type { Language } from './languages';
import type { AnalysisItem, GoogleLanguage } from '@vocably/model';

type Translations = {
  // The headline of the first screenshot.
  title: string;
  // Shown under the flags of the first screenshot.
  languageCount: string;
  // The search field text of the second screenshot.
  search: string;
  sourceLanguage: GoogleLanguage;
  // The first item /analyze returns for `search`.
  searchItem: AnalysisItem;
  // Wrong answers for `searchItem` in the multi-choice study screenshot.
  incorrectTranslations: [string, string, string];
  // The add button and the examples label of the analysis item, as the
  // extension words them.
  learnButton: string;
  example: string;
  // The headline of the second screenshot and the line under it.
  translate: string;
  translateSub: string;
  // The headline of the third screenshot and the line under it.
  learn: string;
  learnSub: string;
};

// The copy shown on the assets, per interface language.
export const localization: Record<Language, Translations> = {
  en: {
    title: 'A language-\nlearning tool.',
    languageCount: '100+ languages.',
    search: 'magic',
    sourceLanguage: 'de',
    searchItem: {
      source: 'die Magie',
      translation: 'magic',
      definitions: [
        'Die Kunst, übernatürliche Kräfte zu beeinflussen oder zu nutzen.',
        'Eine geheimnisvolle, faszinierende Wirkung oder Ausstrahlung.',
      ],
      examples: [
        'Schwarze Magie.',
        'Die Magie des Augenblicks.',
        'Er glaubt an Magie.',
      ],
      partOfSpeech: 'noun',
      ipa: 'maˈɡiː',
      g: 'feminine',
      number: 'singular',
      pluralForm: 'die Magien',
    },
    incorrectTranslations: ['luck', 'mystery', 'dream'],
    learnButton: 'Learn',
    example: 'Example:',
    translate: 'Translate',
    translateSub: 'any words or phrases.',
    learn: 'Learn',
    learnSub: 'with quizzes and\nother question types.',
  },
  es: {
    title: 'Una herramienta para aprender idiomas.',
    languageCount: 'Más de 100 idiomas.',
    search: 'confiable',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'fiable, confiable',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    incorrectTranslations: ['rápido, veloz', 'caro, costoso', 'frágil, débil'],
    learnButton: 'Aprender',
    example: 'Ejemplo:',
    translate: 'Traduce',
    translateSub: 'cualquier palabra o frase.',
    learn: 'Aprende',
    learnSub: 'con cuestionarios y otros tipos de preguntas.',
  },
  pt: {
    title: 'Uma ferramenta para aprender idiomas.',
    languageCount: 'Mais de 100 idiomas.',
    search: 'confiável',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'confiável, fidedigno',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    incorrectTranslations: ['rápido, veloz', 'caro, custoso', 'frágil, fraco'],
    learnButton: 'Aprender',
    example: 'Exemplo:',
    translate: 'Traduza',
    translateSub: 'quaisquer palavras ou frases.',
    learn: 'Aprenda',
    learnSub: 'com testes e outros tipos de perguntas.',
  },
  ru: {
    title: 'Инструмент для изучения языков.',
    languageCount: 'Более 100 языков.',
    search: 'надёжный',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'надежный, достоверный',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    incorrectTranslations: [
      'быстрый, скорый',
      'дорогой, ценный',
      'хрупкий, слабый',
    ],
    learnButton: 'Учить',
    example: 'Пример:',
    translate: 'Переводите',
    translateSub: 'любые слова и фразы.',
    learn: 'Учите',
    learnSub: 'при помощи тестов и других типов вопросов.',
  },
  uk: {
    title: 'Інструмент для вивчення мов.',
    languageCount: 'Понад 100 мов.',
    search: 'надійний',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'надійний, достовірний',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    incorrectTranslations: [
      'швидкий, скорий',
      'дорогий, цінний',
      'крихкий, слабкий',
    ],
    learnButton: 'Вчити',
    example: 'Приклад:',
    translate: 'Перекладайте',
    translateSub: 'будь-які слова та фрази.',
    learn: 'Вчіть',
    learnSub: 'за допомогою тестів та інших типів запитань.',
  },
  tr: {
    title: 'Bir dil öğrenme aracı.',
    languageCount: '100+ dil.',
    search: 'güvenilir',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'güvenilir, sağlam',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    incorrectTranslations: [
      'hızlı, çabuk',
      'pahalı, değerli',
      'kırılgan, zayıf',
    ],
    learnButton: 'Öğren',
    example: 'Örnek:',
    translate: 'Çevirin',
    translateSub: 'her türlü kelime ve ifadeyi.',
    learn: 'Öğrenin',
    learnSub: 'testler ve diğer soru türleriyle.',
  },
  vi: {
    title: 'Công cụ học ngoại ngữ.',
    languageCount: 'Hơn 100 ngôn ngữ.',
    search: 'đáng tin cậy',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'đáng tin cậy, tin cậy',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    incorrectTranslations: [
      'nhanh, nhanh chóng',
      'đắt, đắt tiền',
      'mong manh, yếu ớt',
    ],
    learnButton: 'Học',
    example: 'Ví dụ:',
    translate: 'Dịch',
    translateSub: 'bất kỳ từ hoặc cụm từ nào.',
    learn: 'Học',
    learnSub: 'qua các bài kiểm tra và nhiều dạng câu hỏi khác.',
  },
};
