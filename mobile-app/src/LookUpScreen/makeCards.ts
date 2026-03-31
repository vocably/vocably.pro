import { Analysis, Card } from '@vocably/model';
import { join } from '@vocably/sulna';
import { pick } from 'lodash-es';

export const makeCards = (analysis: Analysis): Card[] => {
  return analysis.items.map((item) => ({
    language: analysis.sourceLanguage,
    source: item.source,
    ipa: item.ipa ?? '',
    definition: join(item.definitions),
    example: join(item.examples ?? []),
    translation: item.translation,
    partOfSpeech: item.partOfSpeech ?? '',
    ...pick(item, [
      'g',
      'tense',
      'pastTenses',
      'presentTenses',
      'number',
      'pluralForm',
    ]),
    tags: [],
  }));
};
