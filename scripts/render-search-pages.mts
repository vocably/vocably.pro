#!/usr/bin/env -S npx vite-node

import { GoogleLanguage, languageList, TranslationCards } from '@vocably/model';
import { readFileSync } from 'fs';
import { renderToString } from '@vocably/extension-content-ui/hydrate';
import { writeFileSync } from 'node:fs';
import { trimLanguage } from '@vocably/sulna';

const wordResults: Record<string, TranslationCards> = JSON.parse(
  readFileSync('./search-data/de-en.json', 'utf-8')
) as Record<string, TranslationCards>;

const searchPage = readFileSync('../packages/www/dist/search.html', 'utf-8');

const nameTheFile = (word: string, language: GoogleLanguage): string => {
  const languageName = trimLanguage(languageList[language]);
  return `${word} in ${languageName}`.toLowerCase().replace(/\P{L}/gu, '-');
};

const words = Object.entries(wordResults);

console.log(`${words.length} words found`);

for (const [word, translationCards] of words) {
  const searchValues = {
    text: word,
    sourceLanguage: 'de',
    targetLanguage: 'en',
    isReversed: false,
  };
  const rendered = await renderToString(
    searchPage.replace(
      '<div id="search"></div>',
      `<div id="search"><vocably-search-form values='${JSON.stringify(searchValues)}'></vocably-search-form><div class="results-container"><vocably-translation  result='${JSON.stringify(
        {
          success: true,
          value: translationCards,
        }
      )}' isLightweight="true" showLanguages="false"></vocably-translation></div></div>`
    ),
    {
      title: `${word} in German | Vocably`,
    }
  );
  writeFileSync(
    `../packages/www/src/static/${nameTheFile(word, 'de')}.html`,
    rendered.html
  );
}

process.exit(0);
