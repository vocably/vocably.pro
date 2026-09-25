import type { Language } from './languages';
import type { AnalysisItem, GoogleLanguage } from '@vocably/model';

type Translations = {
  // The headline of the first screenshot.
  title: string;
  // Shown under the flags of the first screenshot.
  languageCount: string;
  search: string;
  sourceLanguage: GoogleLanguage;
  // The first item /analyze returns for `search`.
  searchItem: AnalysisItem;
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
  },
};
