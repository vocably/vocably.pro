import {
  aiAnalysisToItem,
  getAnalyseCacheFileName,
  getUnitOfSpeechTranslationFileName,
  isAiAnalysis,
  sanitizeAiAnalyseResult,
} from '@vocably/analyze';
import {
  AnalysisItem,
  GoogleLanguage,
  isTranslation,
  Translation,
  TranslationCards,
} from '@vocably/model';
import { SeoLanguagePair } from '@vocably/model-operations';
import { DataSource } from './dataSource';

// The page of an English word shows the German units of speech it translates
// to. Everything is read from what the analyze lambdas have already stored;
// nothing is generated here. Mirrors scripts/build-seo-search-data.mts, which
// reads the same data from local checkouts of the data repositories.

type UnitOfSpeech = {
  source: string;
  partOfSpeech: string;
};

// Some units of speech only have British English translations.
const fallbackTargetLanguages: Partial<Record<GoogleLanguage, GoogleLanguage>> =
  {
    en: 'en-GB',
  };

const parseJson = (contents: string): unknown => {
  try {
    return JSON.parse(contents);
  } catch {
    return undefined;
  }
};

/** Mirrors the cache key of aiFetchPossibleTranslationsCached. */
export const getReverseTranslationsPrefix = (
  word: string,
  { sourceLanguage, targetLanguage }: SeoLanguagePair
): string =>
  `_reverse-translations/${sourceLanguage.toLowerCase()}/${targetLanguage.toLowerCase()}/${word
    .toLowerCase()
    .replace(/\//g, '-')}`;

// Reverse translations are cached either as `<word>.json` or, when the input
// type is known, as `<word>/<input type>.json`.
const getReverseTranslations = async (
  dataSource: DataSource,
  word: string,
  pair: SeoLanguagePair
): Promise<Translation[]> => {
  const prefix = getReverseTranslationsPrefix(word, pair);
  const folder = `${prefix}/`;

  const folderKeys = (await dataSource.list(folder))
    .filter((key) => !key.slice(folder.length).includes('/'))
    .filter((key) => key.endsWith('.json'))
    .sort();

  const files = await Promise.all(
    [`${prefix}.json`, ...folderKeys].map((key) => dataSource.read(key))
  );

  return files.flatMap((contents) => {
    if (contents === null) {
      return [];
    }

    const translations = parseJson(contents);

    if (!Array.isArray(translations) || !translations.every(isTranslation)) {
      return [];
    }

    return translations;
  });
};

// Translations are usually saved one per line, but sometimes as a JSON array.
const parseTranslationsFile = (contents: string): string[] => {
  if (contents.trimStart().startsWith('[')) {
    const parsed = parseJson(contents);

    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return contents
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const getTranslations = async (
  dataSource: DataSource,
  unitOfSpeech: UnitOfSpeech,
  { sourceLanguage, targetLanguage }: SeoLanguagePair
): Promise<string[]> => {
  const targetLanguages = [
    targetLanguage,
    fallbackTargetLanguages[targetLanguage],
  ].filter((language) => language !== undefined);

  for (const language of targetLanguages) {
    const contents = await dataSource.read(
      getUnitOfSpeechTranslationFileName({
        ...unitOfSpeech,
        sourceLanguage,
        targetLanguage: language,
      })
    );

    if (contents !== null) {
      return parseTranslationsFile(contents);
    }
  }

  return [];
};

const getAnalysisItem = async (
  dataSource: DataSource,
  unitOfSpeech: UnitOfSpeech,
  pair: SeoLanguagePair
): Promise<AnalysisItem | undefined> => {
  const { sourceLanguage } = pair;
  const { source, partOfSpeech } = unitOfSpeech;

  const [translations, rawAnalysis] = await Promise.all([
    getTranslations(dataSource, unitOfSpeech, pair),
    dataSource.read(
      getAnalyseCacheFileName({ source, partOfSpeech, sourceLanguage })
    ),
  ]);

  if (translations.length === 0 || rawAnalysis === null) {
    return undefined;
  }

  const analysis = parseJson(rawAnalysis);

  if (!isAiAnalysis(analysis)) {
    return undefined;
  }

  const aiAnalysis = sanitizeAiAnalyseResult(
    sourceLanguage,
    partOfSpeech,
    analysis
  );

  if (aiAnalysis.exists === false) {
    return undefined;
  }

  return aiAnalysisToItem({
    aiAnalysis,
    sourceLanguage,
    translations,
    partOfSpeech,
  });
};

// A reverse translation points from an English word to a German unit of
// speech. Its lemma, when different, becomes an additional item.
const translationToUnitsOfSpeech = (
  translation: Translation
): UnitOfSpeech[] => {
  const units: UnitOfSpeech[] = [
    {
      source: translation.target,
      partOfSpeech: translation.partOfSpeech ?? '',
    },
  ];

  if (
    translation.lemma &&
    translation.lemmaPos &&
    translation.target !== translation.lemma
  ) {
    units.push({
      source: translation.lemma,
      partOfSpeech: translation.lemmaPos,
    });
  }

  return units;
};

const areAnalysisItemsEqual =
  (a: AnalysisItem) =>
  (b: AnalysisItem): boolean =>
    a.source.toLowerCase() === b.source.toLowerCase() &&
    a.partOfSpeech === b.partOfSpeech;

/**
 * Resolves to undefined when the word has no reverse translations or none of
 * them has a stored analysis and translation yet.
 */
export const buildTranslationCards = async (
  dataSource: DataSource,
  word: string,
  pair: SeoLanguagePair
): Promise<TranslationCards | undefined> => {
  const unitsOfSpeech = (
    await getReverseTranslations(dataSource, word, pair)
  ).flatMap(translationToUnitsOfSpeech);

  const uniqueUnitsOfSpeech = unitsOfSpeech.filter(
    (unit, index) =>
      unitsOfSpeech.findIndex(
        (other) =>
          other.source === unit.source &&
          other.partOfSpeech === unit.partOfSpeech
      ) === index
  );

  const candidates = await Promise.all(
    uniqueUnitsOfSpeech.map((unit) => getAnalysisItem(dataSource, unit, pair))
  );

  const items: AnalysisItem[] = [];

  for (const item of candidates) {
    if (item && !items.some(areAnalysisItemsEqual(item))) {
      items.push(item);
    }
  }

  if (items.length === 0) {
    return undefined;
  }

  return {
    source: word,
    sourceLanguage: pair.sourceLanguage,
    targetLanguage: pair.targetLanguage,
    isDirect: false,
    deck: {
      cards: [],
      tags: [],
      language: pair.sourceLanguage,
    },
    items,
    detectedInputType: 'word',
    extraItems: [],
    explanation: '',
  };
};
