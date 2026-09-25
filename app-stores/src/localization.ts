import type { Language } from './languages';

type Translations = {
  // The headline of the first screenshot.
  title: string;
  // Shown under the flags of the first screenshot.
  languageCount: string;
};

// The copy shown on the assets, per interface language.
export const localization: Record<Language, Translations> = {
  en: {
    title: 'A combination of smart dictionary and learning system.',
    languageCount: '100+ languages.',
  },
  es: {
    title:
      'Una combinación de diccionario inteligente y sistema de aprendizaje.',
    languageCount: 'Más de 100 idiomas.',
  },
  pt: {
    title:
      'Uma combinação de dicionário inteligente e sistema de aprendizagem.',
    languageCount: 'Mais de 100 idiomas.',
  },
  ru: {
    title: 'Сочетание умного словаря и системы обучения.',
    languageCount: 'Более 100 языков.',
  },
  uk: {
    title: 'Поєднання розумного словника та системи навчання.',
    languageCount: 'Понад 100 мов.',
  },
  tr: {
    title: 'Akıllı sözlük ve öğrenme sisteminin birleşimi.',
    languageCount: '100+ dil.',
  },
  vi: {
    title: 'Sự kết hợp giữa từ điển thông minh và hệ thống học tập.',
    languageCount: 'Hơn 100 ngôn ngữ.',
  },
};
