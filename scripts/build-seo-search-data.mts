#!/usr/bin/env -S npx vite-node

import { listFiles } from './utils.js';
import { readFileSync } from 'fs';
import { existsSync, writeFileSync } from 'node:fs';
import { AnalysisItem, TranslationCards } from '@vocably/model';
import {
  getAnalyseCacheFileName,
  getUnitOfSpeechTranslationFileName,
  sanitizeAiAnalyseResult,
  aiAnalysisToItem,
  isAiAnalysis,
  AiAnalysis,
} from '@vocably/analyze';

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

const languagesFolderPathPrefix = '../../vocably-languages';

const files = await listFiles(
  `${languagesFolderPathPrefix}/de/translations/**/en.txt`
);

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

  const unitOfSpeechFilename = `${languagesFolderPathPrefix}/${getAnalyseCacheFileName(
    {
      source: word,
      partOfSpeech,
      sourceLanguage: 'de',
    }
  )}`;

  if (!existsSync(unitOfSpeechFilename)) {
    console.log(`Unit of speech file ${unitOfSpeechFilename} does not exist`);
    continue;
  }

  const rawAnalysis = JSON.parse(readFileSync(unitOfSpeechFilename, 'utf-8'));

  if (!isAiAnalysis(rawAnalysis)) {
    console.log(
      `Unit of speech file ${unitOfSpeechFilename} is not an AI analysis`
    );
    continue;
  }

  const aiAnalysis = sanitizeAiAnalyseResult('de', partOfSpeech, rawAnalysis);

  if (aiAnalysis.exists === false) {
    console.log(
      `AI says this unit of speech does not exist ${word} ${partOfSpeech}`
    );
    continue;
  }

  const analysisItem = aiAnalysisToItem({
    aiAnalysis,
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
        aiAnalysis,
      });
    }
  }
}

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

    const translationsFilename = `${languagesFolderPathPrefix}/${getUnitOfSpeechTranslationFileName(
      {
        sourceLanguage: 'de',
        targetLanguage: 'en',
        source: aiAnalysis.lemma,
        partOfSpeech: aiAnalysis.lemmaPos,
      }
    )}`;

    if (!existsSync(translationsFilename)) {
      continue;
    }

    const translations = readFileSync(translationsFilename, 'utf-8')
      .split('\n')
      .filter(Boolean);

    const unitOfSpeechFilename = `${languagesFolderPathPrefix}/${getAnalyseCacheFileName(
      {
        source: aiAnalysis.lemma,
        partOfSpeech: aiAnalysis.lemmaPos,
        sourceLanguage: 'de',
      }
    )}`;

    if (!existsSync(unitOfSpeechFilename)) {
      console.log(
        `Enrichment. Unit of speech file ${unitOfSpeechFilename} does not exist`
      );
      continue;
    }

    const rawAnalysis = JSON.parse(readFileSync(unitOfSpeechFilename, 'utf-8'));

    if (!isAiAnalysis(rawAnalysis)) {
      console.log(
        `Enrichment. Unit of speech file ${unitOfSpeechFilename} is not an AI analysis`
      );
      continue;
    }

    const lemmaAiAnalysis = sanitizeAiAnalyseResult(
      'de',
      aiAnalysis.lemmaPos,
      rawAnalysis
    );

    if (lemmaAiAnalysis.exists === false) {
      continue;
    }

    const lemmaAnalysisItem = aiAnalysisToItem({
      aiAnalysis: lemmaAiAnalysis,
      sourceLanguage: 'de',
      translations,
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
      aiAnalysis: lemmaAiAnalysis,
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

writeFileSync(
  '../packages/www/seo/search-data-prod/de-en.json',
  JSON.stringify(wordResults, null, 2)
);
