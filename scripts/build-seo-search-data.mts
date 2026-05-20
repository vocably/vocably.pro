#!/usr/bin/env -S npx vite-node

import { listFiles } from './utils.js';
import { readFileSync } from 'fs';
import { existsSync, writeFileSync } from 'node:fs';
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
} from '@vocably/analyze';
import { parseJson } from '@vocably/api';
import { isArray } from 'lodash-es';

const areAnalysisItemsEqual =
  (a: AnalysisItem) =>
  (b: AnalysisItem): boolean => {
    return (
      a.source.toLowerCase() === b.source.toLowerCase() &&
      a.partOfSpeech === b.partOfSpeech
    );
  };

const sortByTranslation =
  (translation: string) => (a: AnalysisItem, b: AnalysisItem) => {
    if (a.translation.indexOf(translation) === -1) {
      return 1;
    }

    if (b.translation.indexOf(translation) === -1) {
      return -1;
    }

    return (
      a.translation.indexOf(translation) - b.translation.indexOf(translation)
    );
  };

const reverseTranslationsFolderGlobalPrefix =
  '../../vocably-reverse-translations/data';

const reverseTranslationLocalPrefix = `${reverseTranslationsFolderGlobalPrefix}/de/en`;

const reverseTranslationsFiles: Record<string, string> = Object.fromEntries(
  (await listFiles(`${reverseTranslationLocalPrefix}/**/*.json`)).map((f) => [
    f
      .replace(`${reverseTranslationLocalPrefix}/`, '')
      .split('/')[0]
      .replace('.json', ''),
    f,
  ])
);

const languagesFolderPathPrefix = '../../vocably-languages';

const files = await listFiles(
  `${languagesFolderPathPrefix}/de/translations/**/en.txt`
);

const getAiAnalysis = ({
  source,
  partOfSpeech,
  language,
}: {
  source: string;
  partOfSpeech: string;
  language: GoogleLanguage;
}): Result<AiAnalysis> => {
  const unitOfSpeechFilename = `${languagesFolderPathPrefix}/${getAnalyseCacheFileName(
    {
      source,
      partOfSpeech,
      sourceLanguage: language,
    }
  )}`;

  if (!existsSync(unitOfSpeechFilename)) {
    console.log(`Unit of speech file ${unitOfSpeechFilename} does not exist`);
    return {
      success: false,
      reason: 'Unit of speech file does not exist',
      extra: unitOfSpeechFilename,
    };
  }

  const rawAnalysis = JSON.parse(readFileSync(unitOfSpeechFilename, 'utf-8'));

  if (!isAiAnalysis(rawAnalysis)) {
    console.log(
      `Unit of speech file ${unitOfSpeechFilename} is not an AI analysis`
    );
    return {
      success: false,
      reason: `Unit of speech file ${unitOfSpeechFilename} is not an AI analysis`,
      extra: unitOfSpeechFilename,
    };
  }

  const aiAnalysis = sanitizeAiAnalyseResult('de', partOfSpeech, rawAnalysis);

  if (aiAnalysis.exists === false) {
    console.log(
      `AI says this unit of speech does not exist ${source} ${partOfSpeech}`
    );
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

type VeryUsefulData = {
  analysisItem: AnalysisItem;
  aiAnalysis: AiAnalysis;
};
const words: Record<string, VeryUsefulData[]> = {};

console.log('Found', files.length, 'files');

for (const englishFile of files) {
  const translations = readFileSync(englishFile)
    .toString()
    .split('\n')
    .filter(Boolean);
  const word = englishFile.split('/').at(-3) as string;
  const partOfSpeech = englishFile.split('/').at(-2) as string;

  if (partOfSpeech === 'proper noun') {
    console.log(`Skipping proper noun ${word}`);
    continue;
  }

  const aiAnalysisResult = getAiAnalysis({
    source: word,
    partOfSpeech,
    language: 'de',
  });

  if (!aiAnalysisResult.success) {
    continue;
  }

  const analysisItem = aiAnalysisToItem({
    aiAnalysis: aiAnalysisResult.value,
    sourceLanguage: 'de',
    translations,
    partOfSpeech,
  });

  for (let translation of translations.slice(0, 2)) {
    if (!words[translation]) {
      words[translation] = [];
    }

    if (
      !words[translation].some(({ analysisItem: itemToCheck }) =>
        areAnalysisItemsEqual(itemToCheck)(analysisItem)
      )
    ) {
      words[translation].push({
        analysisItem,
        aiAnalysis: aiAnalysisResult.value,
      });
    }
  }
}

const getTranslations = (payload: {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  source: string;
  partOfSpeech: string;
}): Result<string[]> => {
  const translationsFilename = `${languagesFolderPathPrefix}/${getUnitOfSpeechTranslationFileName(payload)}`;

  if (!existsSync(translationsFilename)) {
    console.error(`Translations file ${translationsFilename} does not exist`);
    return {
      success: false,
      reason: `Translations file ${translationsFilename} does not exist`,
    };
  }

  const translations = readFileSync(translationsFilename, 'utf-8')
    .split('\n')
    .filter(Boolean);

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

for (const word of Object.keys(words)) {
  const items = words[word];
  const enrichedItems: VeryUsefulData[] = [];
  items.sort((a, b) => {
    return sortByTranslation(word)(a.analysisItem, b.analysisItem);
  });

  for (let { analysisItem, aiAnalysis } of items) {
    enrichedItems.push({
      analysisItem,
      aiAnalysis,
    });
    if (
      !aiAnalysis.lemma ||
      !aiAnalysis.lemmaPos ||
      aiAnalysis.source === aiAnalysis.lemma
    ) {
      continue;
    }

    const lemmaAiAnalysisResult = getAiAnalysis({
      source: aiAnalysis.lemma,
      partOfSpeech: aiAnalysis.lemmaPos,
      language: 'de',
    });

    if (!lemmaAiAnalysisResult.success) {
      continue;
    }

    const translationsResult = getTranslations({
      sourceLanguage: 'de',
      targetLanguage: 'en',
      source: aiAnalysis.lemma,
      partOfSpeech: aiAnalysis.lemmaPos,
    });

    if (!translationsResult.success) {
      continue;
    }

    const lemmaAnalysisItem = aiAnalysisToItem({
      aiAnalysis: lemmaAiAnalysisResult.value,
      sourceLanguage: 'de',
      translations: translationsResult.value,
      partOfSpeech: aiAnalysis.lemmaPos,
    });

    if (
      enrichedItems.some(({ analysisItem: itemToCheck }) =>
        areAnalysisItemsEqual(itemToCheck)(lemmaAnalysisItem)
      )
    ) {
      continue;
    }

    enrichedItems.push({
      aiAnalysis: lemmaAiAnalysisResult.value,
      analysisItem: lemmaAnalysisItem,
    });
  }

  words[word] = enrichedItems;
}

const wordResults: Record<string, TranslationCards> = {};

for (const [word, analysisItems] of Object.entries(words)) {
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
    items: analysisItems.map(({ analysisItem }) => analysisItem),
    detectedInputType: 'word',
    extraItems: [],
    explanation: '',
  };
}

type ValidTranslations = [Translation, ...Translation[]];
const isValidTranslations = (data: any): data is ValidTranslations => {
  return isArray(data) && data.length > 0 && data.every(isTranslation);
};

const translationToAnalysisItemsResult = (
  translation: Translation
): Result<AnalysisItem[]> => {
  const translationsResult = getTranslations({
    source: translation.target,
    partOfSpeech: translation.partOfSpeech ?? '',
    sourceLanguage: translation.targetLanguage,
    targetLanguage: translation.sourceLanguage,
  });

  if (!translationsResult.success) {
    console.log(
      `Unable to get translations for ${translation.source} ${translation.partOfSpeech} ${translation.targetLanguage} ${translation.sourceLanguage} ${translationsResult.reason}`
    );
    return translationsResult;
  }

  const aiAnalysisResult = getAiAnalysis({
    source: translation.target,
    language: translation.targetLanguage,
    partOfSpeech: translation.partOfSpeech ?? '',
  });

  if (!aiAnalysisResult.success) {
    console.log(
      `Unable to get AI analysis for ${translation.target} ${translation.partOfSpeech} ${translation.targetLanguage} ${translation.sourceLanguage} ${aiAnalysisResult.reason}`
    );

    return aiAnalysisResult;
  }

  const items: AnalysisItem[] = [];

  items.push(
    aiAnalysisToItem({
      aiAnalysis: aiAnalysisResult.value,
      sourceLanguage: translation.targetLanguage,
      translations: translationsResult.value,
      partOfSpeech: translation.partOfSpeech ?? '',
    })
  );

  if (
    !translation.lemma ||
    !translation.lemmaPos ||
    translation.target === translation.lemma
  ) {
    return {
      success: true,
      value: items,
    };
  }

  const lemmaTranslationsResult = getTranslations({
    source: translation.lemma,
    partOfSpeech: translation.lemmaPos,
    sourceLanguage: translation.targetLanguage,
    targetLanguage: translation.sourceLanguage,
  });

  if (!lemmaTranslationsResult.success) {
    return {
      success: true,
      value: items,
    };
  }

  const lemmaAiAnalysisResult = getAiAnalysis({
    source: translation.lemma,
    partOfSpeech: translation.lemmaPos,
    language: translation.targetLanguage,
  });

  if (!lemmaAiAnalysisResult.success) {
    return {
      success: true,
      value: items,
    };
  }

  items.push(
    aiAnalysisToItem({
      aiAnalysis: lemmaAiAnalysisResult.value,
      sourceLanguage: translation.targetLanguage,
      translations: lemmaTranslationsResult.value,
      partOfSpeech: translation.lemmaPos,
    })
  );

  return {
    success: true,
    value: items,
  };
};

console.log('Refining words from reverse analysis...');

for (const [word, translationCards] of Object.entries(wordResults)) {
  if (!reverseTranslationsFiles[word]) {
    continue;
  }

  const reverseTranslationsResult = parseJson(
    readFileSync(reverseTranslationsFiles[word], 'utf-8')
  );

  if (!reverseTranslationsResult.success) {
    console.error(
      `Unable to parse ${reverseTranslationsFiles[word]}`,
      reverseTranslationsResult
    );
    continue;
  }

  if (!isValidTranslations(reverseTranslationsResult.value)) {
    console.error(
      `Non-valid translations ${reverseTranslationsFiles[word]}`,
      reverseTranslationsResult
    );
    continue;
  }

  const items: AnalysisItem[] = [];
  for (const translation of reverseTranslationsResult.value) {
    const analysisItemsResult = translationToAnalysisItemsResult(translation);

    if (!analysisItemsResult.success) {
      continue;
    }

    items.push(...analysisItemsResult.value);
  }
  if (items.length >= translationCards.items.length) {
    translationCards.items = items;
  }
}

writeFileSync(
  '../packages/www/seo/search-data-prod/de-en.json',
  JSON.stringify(wordResults, null, 2)
);
