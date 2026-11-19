#!/usr/bin/env -S npx vite-node

// Reports the German units of speech that the SEO pages (rendered on demand by
// packages/seo-backend from the same data) are missing, and saves them as a
// Claude batch. Mirrors packages/seo-backend/src/buildTranslationCards.ts,
// reading local checkouts of the data repositories instead of S3.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';
import {
  AnalysisItem,
  GoogleLanguage,
  isTranslation,
  Result,
  Translation,
  TranslationCards,
} from '@vocably/model';
import {
  getAnalyseCacheFileName,
  getUnitOfSpeechTranslationFileName,
  sanitizeAiAnalyseResult,
  aiAnalysisToItem,
  isAiAnalysis,
  AiAnalysis,
  getClaudeAnalyzeBatchItem,
  getClaudeAnalyzeBatchItemKey,
} from '@vocably/analyze';
import { parseJson } from '@vocably/api';
import { isArray } from 'lodash-es';

const englishWordsFile = './seo/en-de.json';
const reverseTranslationsFolder =
  '../../vocably-reverse-translations/data/de/en';
const languagesFolderPathPrefix = '../../vocably-languages';
const missingTranslationsFile =
  '../batch-analyze/data/missing-translations.json';
// Picked up by batch-analyze/claude-send-batch.mts. The payloads file maps
// batch custom_ids back to units of speech when handling the results.
const missingUnitsOfSpeechBatchName = `claude-analyze-missing-units-of-speech-de-${Date.now()}`;
const missingUnitsOfSpeechBatchFile = `../batch-analyze/data/batches/${missingUnitsOfSpeechBatchName}.jsonl`;
const missingUnitsOfSpeechPayloadsFile = `../batch-analyze/data/claude-payloads/${missingUnitsOfSpeechBatchName}.json`;

const areAnalysisItemsEqual =
  (a: AnalysisItem) =>
  (b: AnalysisItem): boolean => {
    return (
      a.source.toLowerCase() === b.source.toLowerCase() &&
      a.partOfSpeech === b.partOfSpeech
    );
  };

const getUnitOfSpeechFilename = ({
  source,
  partOfSpeech,
  language,
}: {
  source: string;
  partOfSpeech: string;
  language: GoogleLanguage;
}): string =>
  `${languagesFolderPathPrefix}/${getAnalyseCacheFileName({
    source,
    partOfSpeech,
    sourceLanguage: language,
  })}`;

const getAiAnalysis = ({
  source,
  partOfSpeech,
  language,
}: {
  source: string;
  partOfSpeech: string;
  language: GoogleLanguage;
}): Result<AiAnalysis> => {
  const unitOfSpeechFilename = getUnitOfSpeechFilename({
    source,
    partOfSpeech,
    language,
  });

  if (!existsSync(unitOfSpeechFilename)) {
    return {
      success: false,
      reason: 'Unit of speech file does not exist',
      extra: unitOfSpeechFilename,
    };
  }

  const rawAnalysis = JSON.parse(readFileSync(unitOfSpeechFilename, 'utf-8'));

  if (!isAiAnalysis(rawAnalysis)) {
    return {
      success: false,
      reason: `Unit of speech file ${unitOfSpeechFilename} is not an AI analysis`,
      extra: unitOfSpeechFilename,
    };
  }

  const aiAnalysis = sanitizeAiAnalyseResult(
    language,
    partOfSpeech,
    rawAnalysis
  );

  if (aiAnalysis.exists === false) {
    return {
      success: false,
      reason: `AI says this unit of speech does not exist ${source} ${partOfSpeech}`,
    };
  }

  return {
    success: true,
    value: aiAnalysis,
  };
};

// Some units of speech only have British English translations.
const fallbackTargetLanguages: Partial<Record<GoogleLanguage, GoogleLanguage>> =
  {
    en: 'en-GB',
  };

type TranslationsPayload = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  source: string;
  partOfSpeech: string;
};

const findTranslationsFilename = (
  payload: TranslationsPayload
): string | undefined =>
  [payload.targetLanguage, fallbackTargetLanguages[payload.targetLanguage]]
    .filter((targetLanguage) => targetLanguage !== undefined)
    .map(
      (targetLanguage) =>
        `${languagesFolderPathPrefix}/${getUnitOfSpeechTranslationFileName({
          ...payload,
          targetLanguage,
        })}`
    )
    .find(existsSync);

// Translations are usually saved one per line, but sometimes as a JSON array.
const parseTranslationsFile = (contents: string): string[] => {
  if (contents.trimStart().startsWith('[')) {
    const parseResult = parseJson(contents);

    if (parseResult.success && isArray(parseResult.value)) {
      return parseResult.value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return contents.split('\n').filter(Boolean);
};

const getTranslations = (payload: TranslationsPayload): Result<string[]> => {
  const translationsFilename = findTranslationsFilename(payload);

  if (translationsFilename === undefined) {
    return {
      success: false,
      reason: `Translations file for ${payload.source} (${payload.partOfSpeech}) does not exist`,
    };
  }

  const translations = parseTranslationsFile(
    readFileSync(translationsFilename, 'utf-8')
  );

  if (translations.length === 0) {
    return {
      success: false,
      reason: `Translations file ${translationsFilename} is empty`,
    };
  }

  return {
    success: true,
    value: translations,
  };
};

const getAnalysisItem = ({
  source,
  partOfSpeech,
  sourceLanguage,
  targetLanguage,
}: {
  source: string;
  partOfSpeech: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
}): Result<AnalysisItem> => {
  const translationsResult = getTranslations({
    source,
    partOfSpeech,
    sourceLanguage,
    targetLanguage,
  });

  if (!translationsResult.success) {
    return translationsResult;
  }

  const aiAnalysisResult = getAiAnalysis({
    source,
    partOfSpeech,
    language: sourceLanguage,
  });

  if (!aiAnalysisResult.success) {
    return aiAnalysisResult;
  }

  return {
    success: true,
    value: aiAnalysisToItem({
      aiAnalysis: aiAnalysisResult.value,
      sourceLanguage,
      translations: translationsResult.value,
      partOfSpeech,
    }),
  };
};

type UnitOfSpeech = {
  source: string;
  partOfSpeech: string;
};

// German units of speech lacking a translations file or an analysis file,
// keyed by `source|partOfSpeech` to keep them unique.
const missingTranslations = new Map<string, UnitOfSpeech>();
const missingUnitsOfSpeech = new Map<string, UnitOfSpeech>();

const getAnalysisItemOrRecordMissing = (
  translation: Translation,
  unitOfSpeech: UnitOfSpeech
): AnalysisItem | undefined => {
  const { source, partOfSpeech } = unitOfSpeech;
  const payload = {
    source,
    partOfSpeech,
    sourceLanguage: translation.targetLanguage,
    targetLanguage: translation.sourceLanguage,
  };
  const key = `${source}|${partOfSpeech}`;

  if (findTranslationsFilename(payload) === undefined) {
    missingTranslations.set(key, unitOfSpeech);
  }

  if (
    !existsSync(
      getUnitOfSpeechFilename({
        ...unitOfSpeech,
        language: payload.sourceLanguage,
      })
    )
  ) {
    missingUnitsOfSpeech.set(key, unitOfSpeech);
  }

  const itemResult = getAnalysisItem(payload);

  if (!itemResult.success) {
    console.log(
      `Unable to get analysis item for ${source} (${partOfSpeech}): ${itemResult.reason}`
    );
    return undefined;
  }

  return itemResult.value;
};

// A reverse translation points from an English word to a German unit of
// speech. Its lemma, when different, becomes an additional item.
const translationToAnalysisItems = (
  translation: Translation
): AnalysisItem[] => {
  const items: AnalysisItem[] = [];

  const item = getAnalysisItemOrRecordMissing(translation, {
    source: translation.target,
    partOfSpeech: translation.partOfSpeech ?? '',
  });

  if (item) {
    items.push(item);
  }

  if (
    !translation.lemma ||
    !translation.lemmaPos ||
    translation.target === translation.lemma
  ) {
    return items;
  }

  const lemmaItem = getAnalysisItemOrRecordMissing(translation, {
    source: translation.lemma,
    partOfSpeech: translation.lemmaPos,
  });

  if (lemmaItem) {
    items.push(lemmaItem);
  }

  return items;
};

type ValidTranslations = [Translation, ...Translation[]];
const isValidTranslations = (data: any): data is ValidTranslations => {
  return isArray(data) && data.length > 0 && data.every(isTranslation);
};

// Reverse translations are cached either as `<word>.json` or, when the
// input type is known, as `<word>/<input type>.json`.
const getReverseTranslationFiles = (word: string): string[] => {
  const name = word.toLowerCase().replace(/\//g, '-');
  const files: string[] = [];

  const plainFile = `${reverseTranslationsFolder}/${name}.json`;
  if (existsSync(plainFile)) {
    files.push(plainFile);
  }

  const folder = `${reverseTranslationsFolder}/${name}`;
  if (existsSync(folder)) {
    for (const dirent of readdirSync(folder, { withFileTypes: true })) {
      if (dirent.isFile() && dirent.name.endsWith('.json')) {
        files.push(`${folder}/${dirent.name}`);
      }
    }
  }

  return files;
};

const getReverseTranslations = (word: string): Translation[] => {
  const translations: Translation[] = [];

  for (const file of getReverseTranslationFiles(word)) {
    const parseResult = parseJson(readFileSync(file, 'utf-8'));

    if (!parseResult.success) {
      console.error(`Unable to parse ${file}`, parseResult);
      continue;
    }

    if (!isValidTranslations(parseResult.value)) {
      console.error(`Non-valid translations ${file}`);
      continue;
    }

    translations.push(...parseResult.value);
  }

  return translations;
};

const englishWords: string[] = JSON.parse(
  readFileSync(englishWordsFile, 'utf-8')
);

console.log('Found', englishWords.length, 'English words');

const wordResults: Record<string, TranslationCards> = {};
let missingReverseTranslations = 0;

for (const word of englishWords) {
  const translations = getReverseTranslations(word);

  if (translations.length === 0) {
    missingReverseTranslations++;
    continue;
  }

  const items: AnalysisItem[] = [];

  for (const translation of translations) {
    for (const item of translationToAnalysisItems(translation)) {
      if (!items.some(areAnalysisItemsEqual(item))) {
        items.push(item);
      }
    }
  }

  if (items.length === 0) {
    continue;
  }

  wordResults[word] = {
    source: word,
    sourceLanguage: 'de',
    targetLanguage: 'en',
    isDirect: false,
    deck: {
      cards: [],
      tags: [],
      language: 'de',
    },
    items,
    detectedInputType: 'word',
    extraItems: [],
    explanation: '',
  };
}

console.log(
  `Built ${Object.keys(wordResults).length} words; ${missingReverseTranslations} words have no reverse translations`
);

const sortUnitsOfSpeech = (units: Map<string, UnitOfSpeech>): UnitOfSpeech[] =>
  [...units.values()].sort(
    (a, b) =>
      a.source.localeCompare(b.source) ||
      a.partOfSpeech.localeCompare(b.partOfSpeech)
  );

writeFileSync(
  missingTranslationsFile,
  JSON.stringify(sortUnitsOfSpeech(missingTranslations), null, 2) + '\n'
);

console.log(
  `Saved ${missingTranslations.size} German units of speech without translations to ${missingTranslationsFile}`
);

const missingUnitsOfSpeechPayloads = Object.fromEntries(
  sortUnitsOfSpeech(missingUnitsOfSpeech).map(({ source, partOfSpeech }) => {
    const payload = {
      source,
      partOfSpeech,
      sourceLanguage: 'de' as const,
    };
    return [getClaudeAnalyzeBatchItemKey(payload), payload];
  })
);

mkdirSync(dirname(missingUnitsOfSpeechBatchFile), { recursive: true });
mkdirSync(dirname(missingUnitsOfSpeechPayloadsFile), { recursive: true });

writeFileSync(
  missingUnitsOfSpeechBatchFile,
  Object.values(missingUnitsOfSpeechPayloads)
    .map((payload) => JSON.stringify(getClaudeAnalyzeBatchItem(payload)))
    .join('\n')
);

writeFileSync(
  missingUnitsOfSpeechPayloadsFile,
  JSON.stringify(missingUnitsOfSpeechPayloads)
);

console.log(
  `Saved ${missingUnitsOfSpeech.size} missing German units of speech as a Claude batch to ${missingUnitsOfSpeechBatchFile}`
);
