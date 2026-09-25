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
  // The add button and the examples label of the analysis item, as the
  // extension words them.
  learn: string;
  example: string;
  // The headline of the second screenshot and the line under it.
  translate: string;
  translateSub: string;
};

// The copy shown on the assets, per interface language.
export const localization: Record<Language, Translations> = {
  en: {
    title: 'A combination of smart dictionary and learning system.',
    languageCount: '100+ languages.',
    search: 'magic',
    sourceLanguage: 'de',
    searchItem: {
      source: 'die Magie',
      translation: 'magic, charm',
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
    learn: 'Learn',
    example: 'Example:',
    translate: 'Translate',
    translateSub: 'any words or phrases',
  },
  es: {
    title:
      'Una combinación de diccionario inteligente y sistema de aprendizaje.',
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
    learn: 'Aprender',
    example: 'Ejemplo:',
    translate: 'Traduce',
    translateSub: 'cualquier palabra o frase',
  },
  pt: {
    title:
      'Uma combinação de dicionário inteligente e sistema de aprendizagem.',
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
    learn: 'Aprender',
    example: 'Exemplo:',
    translate: 'Traduza',
    translateSub: 'quaisquer palavras ou frases',
  },
  ru: {
    title: 'Сочетание умного словаря и системы обучения.',
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
    learn: 'Учить',
    example: 'Пример:',
    translate: 'Переводите',
    translateSub: 'любые слова и фразы',
  },
  uk: {
    title: 'Поєднання розумного словника та системи навчання.',
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
    learn: 'Вчити',
    example: 'Приклад:',
    translate: 'Перекладайте',
    translateSub: 'будь-які слова та фрази',
  },
  tr: {
    title: 'Akıllı sözlük ve öğrenme sisteminin birleşimi.',
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
    learn: 'Öğren',
    example: 'Örnek:',
    translate: 'Çevirin',
    translateSub: 'her türlü kelime ve ifadeyi',
  },
  vi: {
    title: 'Sự kết hợp giữa từ điển thông minh và hệ thống học tập.',
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
    learn: 'Học',
    example: 'Ví dụ:',
    translate: 'Dịch',
    translateSub: 'bất kỳ từ hoặc cụm từ nào',
  },
};
