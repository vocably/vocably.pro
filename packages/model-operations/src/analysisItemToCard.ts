import { AnalysisItem, SrsCard } from '@vocably/model';
import { join } from '@vocably/sulna';
import { pick } from 'lodash-es';
import { createSrsItem } from '@vocably/srs';

type Payload = {
  language: string;
  analysisItem: AnalysisItem;
};

export const analysisItemToCard = ({
  language,
  analysisItem,
}: Payload): SrsCard => {
  return {
    language,
    source: analysisItem.source,
    ipa: analysisItem.ipa,
    example: join(analysisItem.examples ?? []),
    definition: join(analysisItem.definitions),
    translation: analysisItem.translation,
    partOfSpeech: analysisItem.partOfSpeech ?? '',
    number: analysisItem.number,
    pastTenses: analysisItem.pastTenses,
    presentTenses: analysisItem.presentTenses,
    tense: analysisItem.tense,
    pluralForm: analysisItem.pluralForm,
    tags: [],
    ...pick(analysisItem, ['g']),
    ...createSrsItem(),
  };
};
