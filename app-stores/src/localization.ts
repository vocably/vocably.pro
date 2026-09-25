import type { Language } from './languages';

type Translations = {
  // The headline of the first screenshot.
  title: string;
};

// The copy shown on the assets, per interface language.
export const localization: Record<Language, Translations> = {
  en: {
    title: 'A combination of smart dictionary and learning system.',
  },
  es: {
    title:
      'Una combinación de diccionario inteligente y sistema de aprendizaje.',
  },
  pt: {
    title:
      'Uma combinação de dicionário inteligente e sistema de aprendizagem.',
  },
  ru: {
    title: 'Сочетание умного словаря и системы обучения.',
  },
  uk: {
    title: 'Поєднання розумного словника та системи навчання.',
  },
  tr: {
    title: 'Akıllı sözlük ve öğrenme sisteminin birleşimi.',
  },
  vi: {
    title: 'Sự kết hợp giữa từ điển thông minh và hệ thống học tập.',
  },
};
