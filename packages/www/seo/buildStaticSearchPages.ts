import { renderToString } from '@vocably/extension-content-ui/hydrate';
import { trimLanguage } from '@vocably/sulna';
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync as nativeWriteFileSync,
} from 'node:fs';
import {
  isGoogleLanguage,
  languageList,
  TranslationCards,
} from '@vocably/model';
import { dirname, join } from 'node:path';
import { generateSitemap } from './generateSitemap';

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

const buildTitle = ({ word, sourceLanguage }: ContentOptions) => {
  const sourceLanguageShortName = trimLanguage(languageList[sourceLanguage]);
  return `"${word}" in ${sourceLanguageShortName} | Vocably`;
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

    const wordResults: Record<string, TranslationCards> = JSON.parse(
      readFileSync(dataFileName, 'utf-8')
    );

    const words = Object.entries(wordResults);

    console.log(
      `Compiling ${words.length} ${sourceLanguage}-${targetLanguage} words to HTML...`
    );

    const files: string[] = [];

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
            `<div id="search"><vocably-search-form values='${JSON.stringify(searchValues)}'></vocably-search-form><div class="results-container"><vocably-translation  result='${JSON.stringify(
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
          ),
        {
          title: buildTitle(contentOptions),
        }
      );

      writeFileSync(`./seo/cache/${htmlFilename}`, rendered.html);
      files.push(htmlFilename);
      result.push({
        fileName: htmlFilename,
        size: rendered.html.length,
      });
    }

    const filesToValidateLastMod = [
      dataFileName,
      './src/pages/search.handlebars',
      '../extension-content-ui/src/components/translation/translation.tsx',
      '../extension-content-ui/src/components/translation-cards/translation-cards.tsx',
    ];

    const sitemap = generateSitemap({
      pages: files.map((path) => ({
        path: path,
        priority: '0.5',
        filesToValidateLastMod,
      })),
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
