import { AnalysisItem, CardItem, GoogleLanguage } from '@vocably/model';
import { createSrsItem } from '@vocably/srs';
import { join, sanitizeTranscript } from '@vocably/sulna';
import { nanoid } from 'nanoid';

export const analysisItemToCardItem = (
  language: GoogleLanguage,
  analysisItem: AnalysisItem
): CardItem => {
  const now = +new Date();

  return {
    id: nanoid(5),
    created: now,
    data: {
      language,
      source: analysisItem.source,
      ipa: sanitizeTranscript(analysisItem.ipa ?? ''),
      example: join(analysisItem.examples ?? []),
      definition: join(analysisItem.definitions),
      translation: analysisItem.translation,
      partOfSpeech: analysisItem.partOfSpeech ?? '',
      g: analysisItem.g,
      number: analysisItem.number,
      tense: analysisItem.tense,
      pastTenses: analysisItem.pastTenses,
      pluralForm: analysisItem.pluralForm,
      tags: [],
      ...createSrsItem(),
    },
  };
};
