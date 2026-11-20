#!/usr/bin/env -S npx vite-node

// Usage: ./claude-batch-missing-units-of-speech.mts es-en
// where the argument is {sourceLanguage}-{targetLanguage}.
//
// Walks through the {targetLanguage} words of
// ../scripts/seo/{targetLanguage}-{sourceLanguage}.json, reads their
// reverse translations into {sourceLanguage} and creates a Claude batch
// analysing every {sourceLanguage} unit of speech (and its lemma) that has
// no file in vocably-languages yet.

import {
  getAnalyseCacheFileName,
  getClaudeAnalyzeBatchItem,
} from '@vocably/analyze';
import { isGoogleLanguage, isTranslation, Translation } from '@vocably/model';
import { config } from 'dotenv-flow';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {
  type AnalyzeUnitOfSpeechPayload,
  claudeAnalyzeBatchPrefix,
  type ClaudeAnalyzePayloads,
  claudePayloadsDir,
  languagesDir,
  reverseTranslationsDir,
  seoWordListsDir,
} from './claude-utils.js';

config();

const direction = process.argv[2];
const [sourceLanguage, targetLanguage] = direction?.split('-') ?? [];

if (
  !sourceLanguage ||
  !targetLanguage ||
  !isGoogleLanguage(sourceLanguage) ||
  !isGoogleLanguage(targetLanguage)
) {
  console.error(
    'Usage: claude-batch-missing-units-of-speech.mts {sourceLanguage}-{targetLanguage}, e.g. es-en'
  );
  process.exit(1);
}

const wordListFile = `${seoWordListsDir}/${targetLanguage}-${sourceLanguage}.json`;
const reverseTranslationsFolder = `${reverseTranslationsDir}/${sourceLanguage}/${targetLanguage}`;

if (!existsSync(wordListFile)) {
  console.error(`Word list ${wordListFile} does not exist.`);
  process.exit(1);
}

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
    let data: unknown;

    try {
      data = JSON.parse(readFileSync(file, 'utf-8'));
    } catch (e) {
      console.error(`Unable to parse ${file}: ${e}`);
      continue;
    }

    if (!Array.isArray(data) || !data.every(isTranslation)) {
      console.error(`Non-valid translations ${file}`);
      continue;
    }

    translations.push(...data);
  }

  return translations;
};

// A reverse translation points to a unit of speech of the source language.
// Its lemma, when different, is a unit of speech too.
const getUnitsOfSpeech = (
  translation: Translation
): { source: string; partOfSpeech: string }[] => {
  const units = [
    {
      source: translation.target,
      partOfSpeech: translation.partOfSpeech ?? '',
    },
  ];

  if (
    translation.lemma &&
    translation.lemmaPos &&
    translation.lemma !== translation.target
  ) {
    units.push({
      source: translation.lemma,
      partOfSpeech: translation.lemmaPos,
    });
  }

  return units;
};

const words: string[] = JSON.parse(readFileSync(wordListFile, 'utf-8'));

console.log(`Found ${words.length} ${targetLanguage} words in ${wordListFile}`);

const rows: ReturnType<typeof getClaudeAnalyzeBatchItem>[] = [];
const payloads: ClaudeAnalyzePayloads = {};
let withoutReverseTranslations = 0;
let existing = 0;
let duplicates = 0;

for (const word of words) {
  const translations = getReverseTranslations(word);

  if (translations.length === 0) {
    withoutReverseTranslations++;
    continue;
  }

  for (const translation of translations) {
    for (const { source, partOfSpeech } of getUnitsOfSpeech(translation)) {
      const payload: AnalyzeUnitOfSpeechPayload = {
        source,
        partOfSpeech,
        sourceLanguage,
      };

      if (existsSync(`${languagesDir}/${getAnalyseCacheFileName(payload)}`)) {
        existing++;
        continue;
      }

      const item = getClaudeAnalyzeBatchItem(payload);

      if (payloads[item.custom_id]) {
        duplicates++;
        continue;
      }

      payloads[item.custom_id] = payload;
      rows.push(item);
    }
  }
}

console.log(
  `${withoutReverseTranslations} words have no reverse translations. Skipped ${existing} existing and ${duplicates} duplicate units of speech.`
);

if (rows.length === 0) {
  console.log('No missing units of speech.');
  process.exit(0);
}

const name = `${claudeAnalyzeBatchPrefix}missing-units-of-speech-${sourceLanguage}-${Date.now()}`;

mkdirSync('./data/batches', { recursive: true });
mkdirSync(claudePayloadsDir, { recursive: true });

const batchFile = `./data/batches/${name}.jsonl`;

writeFileSync(batchFile, rows.map((r) => JSON.stringify(r)).join('\n'));
writeFileSync(`${claudePayloadsDir}/${name}.json`, JSON.stringify(payloads));

console.log(`Wrote ${rows.length} batch items to ${batchFile}`);
