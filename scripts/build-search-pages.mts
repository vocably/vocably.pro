#!/usr/bin/env -S npx vite-node

import { listFiles } from './utils.js';
import { readFileSync } from 'fs';
import { existsSync, writeFileSync } from 'node:fs';
import { AnalysisItem, TranslationCards } from '@vocably/model';
import {
  getAnalyseCacheFileName,
  sanitizeAiAnalyseResult,
  aiAnalysisToItem,
  isAiAnalysis,
} from '@vocably/analyze';
import { renderToString } from '@vocably/extension-content-ui/hydrate';

const areAnalysisItemsEqual =
  (a: AnalysisItem) =>
  (b: AnalysisItem): boolean => {
    return (
      a.source.toLowerCase() === b.source.toLowerCase() &&
      a.partOfSpeech === b.partOfSpeech
    );
  };

const files = await listFiles(
  '../../vocably-languages/de/translations/**/en.txt'
);

const words: Record<string, AnalysisItem[]> = {};

console.log('Found', files.length, 'files');

for (const englishFile of files) {
  const translations = readFileSync(englishFile)
    .toString()
    .split('\n')
    .filter(Boolean);
  const word = englishFile.split('/').at(-3) as string;
  const partOfSpeech = englishFile.split('/').at(-2) as string;

  const unitOfSpeechFilename = `../../vocably-languages/${getAnalyseCacheFileName(
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

    if (!words[translation].some(areAnalysisItemsEqual(analysisItem))) {
      words[translation].push(analysisItem);
    }
  }
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
    items: analysisItems,
    detectedInputType: 'word',
    extraItems: [],
    explanation: '',
  };
}

writeFileSync('./search-data/de-en.json', JSON.stringify(wordResults, null, 2));
