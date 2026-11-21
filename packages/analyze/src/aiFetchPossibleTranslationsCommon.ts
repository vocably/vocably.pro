import {
  DetectedInputType,
  GoogleLanguage,
  Result,
  Translation,
} from '@vocably/model';
import { isSafeObject, sanitizeTranscript, trimArticle } from '@vocably/sulna';
import { get, isArray, uniqBy } from 'lodash-es';
import { sanitizePartOfSpeech } from './sanitizePartOfSpeech';

export type Payload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  inputType?: DetectedInputType;
};

type AiTranslationVariant = {
  translation: string;
  partOfSpeech?: string;
  transcript?: string;
  lemma?: string;
  lemmaPos?: string;
};

export type AiTranslationResult = [
  AiTranslationVariant,
  ...AiTranslationVariant[],
];
export type ValidTranslations = [Translation, ...Translation[]];

export const sanitizeModelResponse = (
  data: any
): Result<AiTranslationResult> => {
  const translationCandidates = isArray(data)
    ? data
    : get(data, 'translations');

  if (!isArray(translationCandidates)) {
    return {
      success: false,
      reason: `The provided result is not an array`,
      extra: { data },
    };
  }

  const translationVariants = translationCandidates
    .filter(isTranslationVariant)
    .slice(0, 6);

  if (translationVariants.length === 0) {
    return {
      success: false,
      reason: `There are no valid translation variants`,
      extra: { data },
    };
  }

  return {
    success: true,
    value: [translationVariants[0], ...translationVariants.slice(1)],
  };
};

const isTranslationVariant = (data: any): data is AiTranslationVariant => {
  return (
    isSafeObject(data) &&
    typeof data['translation'] === 'string' &&
    (!data['partOfSpeech'] || typeof data['partOfSpeech'] === 'string') &&
    (!data['lemma'] || typeof data['lemma'] === 'string') &&
    (!data['lemmaPos'] || typeof data['lemmaPos'] === 'string')
  );
};

const sanitizeTranslationVariant =
  (payload: Payload) =>
  (translationVariant: AiTranslationVariant): AiTranslationVariant => {
    if (
      payload.targetLanguage === 'en' &&
      translationVariant.partOfSpeech === 'verb'
    ) {
      return {
        ...translationVariant,
        translation: translationVariant.translation.replace(/to /i, ''),
        transcript: (translationVariant.transcript ?? '').replace(/tu /i, ''),
      };
    }

    return translationVariant;
  };

export const toValidTranslations = (
  payload: Payload,
  translationVariants: AiTranslationResult
): ValidTranslations => {
  const translations = uniqBy(
    translationVariants
      .map(sanitizeTranslationVariant(payload))
      .map((translationVariant) => ({
        source: payload.source,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: payload.targetLanguage,
        target: translationVariant.translation,
        partOfSpeech: sanitizePartOfSpeech(
          translationVariant.partOfSpeech ?? payload.inputType ?? ''
        ),
        transcript: sanitizeTranscript(translationVariant.transcript ?? ''),
        lemma: translationVariant.lemma,
        lemmaPos: sanitizePartOfSpeech(translationVariant.lemmaPos ?? ''),
      }))
      .map((translationVariant) => {
        return {
          ...translationVariant,
          target: trimArticle(payload.targetLanguage, translationVariant.target)
            .source,
        };
      }),
    (itemToCompare) => {
      return itemToCompare.target + itemToCompare.partOfSpeech;
    }
  );

  return [translations[0], ...translations.slice(1)];
};
