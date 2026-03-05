import { TranslationServiceClient } from '@google-cloud/translate';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const PROJECT_ID = 'vocably-332109';
const LOCATION = 'global';
const EXAMPLES_DIR = './packages/app/src/assets/language-text-examples';

const client = new TranslationServiceClient();

const enContent = readFileSync(join(EXAMPLES_DIR, 'en.html'), 'utf-8');

// Language code mappings (file code -> Google Translate language code)
// Most are the same, but some need adjustment
const languageCodeMap = {
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  pt: 'pt-BR',
  'pt-PT': 'pt-PT',
  'en-GB': 'en-GB',
};

function toGoogleLangCode(fileCode) {
  return languageCodeMap[fileCode] ?? fileCode;
}

async function translateContent(content, targetLang) {
  const request = {
    parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
    contents: [content],
    mimeType: 'text/html',
    targetLanguageCode: targetLang,
    sourceLanguageCode: 'en',
  };

  const [response] = await client.translateText(request);
  return response.translations[0].translatedText;
}

async function main() {
  const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.html'));
  const languages = files.map((f) => basename(f, '.html'));

  console.log(`Found ${languages.length} language files`);

  for (const langCode of languages) {
    if (langCode === 'en') {
      console.log(`Skipping en (source language)`);
      continue;
    }

    const googleLangCode = toGoogleLangCode(langCode);
    console.log(`Translating ${langCode} (${googleLangCode})...`);

    try {
      const translated = await translateContent(enContent, googleLangCode);
      writeFileSync(
        join(EXAMPLES_DIR, `${langCode}.html`),
        translated + '\n',
        'utf-8'
      );
      console.log(`  ✓ Done`);
    } catch (err) {
      console.error(`  ✗ Error for ${langCode}: ${err.message}`);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
