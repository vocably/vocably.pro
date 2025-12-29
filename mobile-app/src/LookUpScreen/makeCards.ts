import { Analysis, Card } from '@vocably/model';
import { join } from '@vocably/sulna';
import { pick } from 'lodash-es';

export const makeCards = (analysis: Analysis): Card[] => {
  if (analysis.items && analysis.items.length > 0) {
    return analysis.items.map((item) => ({
      language: analysis.translation.sourceLanguage,
      source: item.source,
      ipa: item.ipa ?? '',
      definition: join(item.definitions),
      example: join(item.examples ?? []),
      translation: item.translation,
      partOfSpeech: item.partOfSpeech ?? '',
      ...pick(item, ['g', 'tense', 'pastTenses', 'number', 'pluralForm']),
      tags: [],
    }));
  }

  return [
    {
      language: analysis.translation.sourceLanguage,
      source: analysis.source,
      translation: analysis.translation.target,
      definition: '',
      partOfSpeech: '',
      tags: [],
    },
  ];
};
