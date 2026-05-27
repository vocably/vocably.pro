import { renderToString } from '@vocably/extension-content-ui/hydrate';
import { trimLanguage, join as joinDefinitions } from '@vocably/sulna';
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync as nativeWriteFileSync,
} from 'node:fs';
import {
  AnalysisItem,
  isGoogleLanguage,
  languageList,
  TranslationCards,
} from '@vocably/model';
import { dirname, join } from 'node:path';
import { getExistingSeoSearchSitemap } from './getExistingSeoSearchSitemap';
import { generateSeoSearchSitemap } from './generateSeoSearchSitemap';
import { createHash } from 'node:crypto';
import { cardToLocationHash } from '@vocably/model-operations';

const globalVersion = 2;

type ContentOptions = {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
};
const nameTheFile = ({
  word,
  sourceLanguage,
  targetLanguage,
}: ContentOptions) => {
  const sourceLanguageShortName = trimLanguage(languageList[sourceLanguage]);
  return (
    `${sourceLanguage}-${targetLanguage}/` +
    `${word} in ${sourceLanguageShortName}`
      .toLowerCase()
      .replace(/\P{L}/gu, '-')
  );
};

const buildPageName = ({ word, sourceLanguage }: ContentOptions) => {
  const sourceLanguageShortName = trimLanguage(languageList[sourceLanguage]);
  return `"${word}" in ${sourceLanguageShortName}`;
};

const buildTitle = (options: ContentOptions) => {
  return `${buildPageName(options)} | Vocably`;
};

const buildDescription = ({ word, sourceLanguage }: ContentOptions) => {
  const sourceLanguageShortName = trimLanguage(languageList[sourceLanguage]);
  return `"${word}" in ${sourceLanguageShortName} | Vocably - a dictionary for ${sourceLanguageShortName} learners`;
};

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const htmlSpecialChars = (str: string): string => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
};

type Options = {
  templateHtml: string;
  searchDataFolder: string;
  basePath: string;
  searchPageFileName: string;
};

type StaticPage = {
  fileName: string;
  size: number;
};

const htmlEntities = (rawText: string): string =>
  rawText.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
    return '&#' + i.charCodeAt(0) + ';';
  });

const itemMeaning = (item: AnalysisItem): string =>
  `<strong class="text-nowrap">${htmlEntities(item.source)}</strong>${item.partOfSpeech ? ` (${htmlEntities(item.partOfSpeech)})` : ''}`;

const buildSeoParagraph = (translationCards: TranslationCards): string => {
  const start = `<strong>${htmlEntities(translationCards.source)}</strong> in ${languageList[translationCards.sourceLanguage]}`;
  if (translationCards.items.length === 1) {
    return start + ` is ${itemMeaning(translationCards.items[0])}.`;
  }

  const meaning = translationCards.items.map(itemMeaning);

  return (
    start +
    ` can be: ` +
    [meaning.slice(0, -1).join(', '), meaning.slice(-1)].join(' or ') +
    '.'
  );
};

export const buildStaticSearchPages = async ({
  templateHtml,
  searchDataFolder,
  basePath,
  searchPageFileName,
}: Options): Promise<StaticPage[]> => {
  const dataFiles = getAllFilesSync(searchDataFolder);

  if (dataFiles.length === 0) {
    throw Error(`No data files can be found in ${searchDataFolder}`);
  }

  const replaceExpressions = {
    canonical: new RegExp(
      `<link rel="canonical" href="${escapeRegExp(`${basePath}/${searchPageFileName}`)}".*?>`,
      'gmi'
    ),
    container: new RegExp(escapeRegExp('<div id="search"></div>'), 'gmi'),
    description: new RegExp(`<meta name="description".*?>`, 'gmi'),
    ogDescription: new RegExp(`<meta property="og:description".*?>`, 'gmi'),
    ogTitle: new RegExp(`<meta property="og:title".*?>`, 'gmi'),
    ogUrl: new RegExp(`<meta property="og:url".*?>`, 'gmi'),
  };

  for (const [containerName, expression] of Object.entries(
    replaceExpressions
  )) {
    if (!expression.test(templateHtml)) {
      throw Error(
        `A crucial block can't be found in the template: ${containerName}`
      );
    }
  }

  const result: StaticPage[] = [];

  for (const dataFileName of dataFiles) {
    const [sourceLanguage, targetLanguage] = dataFileName
      .split('/')
      .at(-1)
      .replace('.json', '')
      .split('-');

    if (
      !isGoogleLanguage(sourceLanguage) ||
      !isGoogleLanguage(targetLanguage)
    ) {
      return;
    }

    const existingSitemap = await getExistingSeoSearchSitemap(
      sourceLanguage,
      targetLanguage
    );

    const wordResults: Record<string, TranslationCards> = JSON.parse(
      readFileSync(dataFileName, 'utf-8')
    );

    const words = Object.entries(wordResults);

    console.log(
      `Compiling ${words.length} ${sourceLanguage}-${targetLanguage} words to HTML...`
    );

    const files: Array<{
      relativePath: string;
      hash: string;
    }> = [];

    for (const [word, translationCards] of words) {
      const contentOptions: ContentOptions = {
        word,
        sourceLanguage,
        targetLanguage,
      };

      const searchValues = {
        text: word,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        isReversed: false,
      };

      const htmlFilename = `${nameTheFile(contentOptions)}.html`;
      const canonicalUrl = `${basePath}/${htmlFilename}`;

      const rendered = await renderToString(
        templateHtml
          .replace(
            replaceExpressions.container,
            `<div id="search"><vocably-search-form values='${JSON.stringify(searchValues)}'></vocably-search-form><p class="mb-2" style="margin-left: 12px;" id="explanation">${buildSeoParagraph(translationCards)}</p><div class="results-container"><vocably-translation  result='${JSON.stringify(
              {
                success: true,
                value: translationCards,
              }
            )}' isLightweight="true" showLanguages="false"></vocably-translation></div></div>`
          )
          .replace(
            replaceExpressions.canonical,
            `<link rel="canonical" href="${canonicalUrl}">`
          )
          .replace(
            replaceExpressions.description,
            `<meta name="description" content="${htmlSpecialChars(buildDescription(contentOptions))}" />`
          )
          .replace(
            replaceExpressions.ogTitle,
            `<meta property="og:title" content="${htmlSpecialChars(buildTitle(contentOptions))}" />`
          )
          .replace(
            replaceExpressions.ogDescription,
            `<meta property="og:description" content="${htmlSpecialChars(buildDescription(contentOptions))}" />`
          )
          .replace(
            replaceExpressions.ogUrl,
            `<meta property="og:url" content="${canonicalUrl}" />`
          )
          .replace(
            `</head>`,
            `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  '@id': canonicalUrl,
  name: buildPageName(contentOptions),
  hasDefinedTerm: translationCards.items.map((item) => ({
    '@type': 'DefinedTerm',
    '@id':
      canonicalUrl +
      cardToLocationHash({
        source: item.source,
        partOfSpeech: item.partOfSpeech,
      }),
    termCode: item.source,
    name: {
      '@value': item.source,
      '@language': sourceLanguage,
    },
    alternateName: {
      '@value': item.translation,
      '@language': targetLanguage,
    },
    description: joinDefinitions(item.definitions),
  })),
})}
</script></head>`
          ),
        {
          title: buildTitle(contentOptions),
        }
      );

      writeFileSync(`./seo/cache/${htmlFilename}`, rendered.html);
      files.push({
        relativePath: htmlFilename,
        hash: sha256(
          JSON.stringify({
            word,
            translationCards,
            globalVersion,
          })
        ),
      });
      result.push({
        fileName: htmlFilename,
        size: rendered.html.length,
      });
    }

    const sitemap = generateSeoSearchSitemap({
      pages: files.map(({ relativePath, hash }) => ({
        loc: `https://vocably.pro/${relativePath}`,
        priority: '0.5',
        hash: hash,
      })),
      existingSitemap,
    });

    result.push({
      fileName: `${sourceLanguage}-${targetLanguage}/sitemap.xml`,
      size: sitemap.length,
    });

    const sitemapFilename = `${sourceLanguage}-${targetLanguage}/sitemap.xml`;
    writeFileSync(`./seo/cache/${sitemapFilename}`, sitemap);
    result.push({
      fileName: sitemapFilename,
      size: sitemap.length,
    });
  }

  cpSync('./seo/cache', './dist', { recursive: true, force: true });

  return result;
};

function getAllFilesSync(dirPath: string, fileList: string[] = []): string[] {
  const files: string[] = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);

    if (statSync(filePath).isDirectory()) {
      getAllFilesSync(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function writeFileSync(fileName: string, contents: string) {
  const dirPath = dirname(fileName);
  mkdirSync(dirPath, { recursive: true });
  nativeWriteFileSync(fileName, contents, 'utf-8');
}

function sha256(input: string): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
