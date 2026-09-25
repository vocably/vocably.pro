import type { Language } from './languages';
import type { GoogleLanguage } from '@vocably/model';

type Translations = {
  // The headline of the first screenshot.
  title: string;
  // Shown under the flags of the first screenshot.
  languageCount: string;
  search: string;
  sourceLanguage: GoogleLanguage;
};

// The copy shown on the assets, per interface language.
export const localization: Record<Language, Translations> = {
  en: {
    title: 'A combination of smart dictionary and learning system.',
    languageCount: '100+ languages.',
    search: 'magic',
    sourceLanguage: 'de',
  },
  es: {
    title:
      'Una combinación de diccionario inteligente y sistema de aprendizaje.',
    languageCount: 'Más de 100 idiomas.',
    search: 'confiable',
    sourceLanguage: 'en',
  },
  pt: {
    title:
      'Uma combinação de dicionário inteligente e sistema de aprendizagem.',
    languageCount: 'Mais de 100 idiomas.',
    search: 'confiável',
    sourceLanguage: 'en',
  },
  ru: {
    title: 'Сочетание умного словаря и системы обучения.',
    languageCount: 'Более 100 языков.',
    search: 'надёжный',
    sourceLanguage: 'en',
  },
  uk: {
    title: 'Поєднання розумного словника та системи навчання.',
    languageCount: 'Понад 100 мов.',
    search: 'надійний',
    sourceLanguage: 'en',
  },
  tr: {
    title: 'Akıllı sözlük ve öğrenme sisteminin birleşimi.',
    languageCount: '100+ dil.',
    search: 'güvenilir',
    sourceLanguage: 'en',
  },
  vi: {
    title: 'Sự kết hợp giữa từ điển thông minh và hệ thống học tập.',
    languageCount: 'Hơn 100 ngôn ngữ.',
    search: 'đáng tin cậy',
    sourceLanguage: 'en',
  },
};
