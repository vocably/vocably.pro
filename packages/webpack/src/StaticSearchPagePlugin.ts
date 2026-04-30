import HtmlWebpackPlugin from 'html-webpack-plugin';
import { renderToString } from '@vocably/extension-content-ui/hydrate/index.js';
import { trimLanguage } from '@vocably/sulna';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import {
  isGoogleLanguage,
  languageList,
  TranslationCards,
} from '@vocably/model';
import { join } from 'node:path';

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
  const targetLanguageName = trimLanguage(languageList[targetLanguage]);
  return (
    `${sourceLanguage}-${targetLanguage}/` +
    `${word} in ${targetLanguageName}`.toLowerCase().replace(/\P{L}/gu, '-')
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
  searchDataFolder: string;
  searchPageFilename: string;
  basePath: string;
};

export class StaticSearchPagePlugin {
  public hasBeenBuilt = false;
  public options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('StaticSearchPagePlugin', (compilation) => {
      // Access the hooks provided by HtmlWebpackPlugin
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'StaticSearchPagePlugin',
        async (data, callback) => {
          if (
            data.plugin.userOptions.filename !== this.options.searchPageFilename
          ) {
            return callback(null, data);
          }

          const templateHtml = data.html;

          const dataFiles = getAllFilesSync(this.options.searchDataFolder);

          if (dataFiles.length === 0) {
            return callback(
              Error(
                `No data files can be found in ${this.options.searchDataFolder}`
              ),
              data
            );
          }

          const replaceExpressions = {
            canonical: new RegExp(
              `<link rel="canonical" href="${escapeRegExp(`${this.options.basePath}/${this.options.searchPageFilename}`)}".*?>`,
              'gmi'
            ),
            container: new RegExp(
              escapeRegExp('<div id="search"></div>'),
              'gmi'
            ),
            description: new RegExp(`<meta name="description".*?>`, 'gmi'),
            ogDescription: new RegExp(
              `<meta property="og:description".*?>`,
              'gmi'
            ),
            ogTitle: new RegExp(`<meta property="og:title".*?>`, 'gmi'),
            ogUrl: new RegExp(`<meta property="og:url".*?>`, 'gmi'),
          };

          for (const [containerName, expression] of Object.entries(
            replaceExpressions
          )) {
            if (!expression.test(templateHtml)) {
              return callback(
                Error(
                  `A crucial block can't be found in the template: ${containerName}`
                ),
                data
              );
            }
          }

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
              return callback(
                Error('Source or target language is not detected'),
                data
              );
            }

            const wordResults: Record<string, TranslationCards> = JSON.parse(
              readFileSync(dataFileName, 'utf-8')
            );

            const words = Object.entries(wordResults);

            console.log(
              `Compiling ${words.length} ${sourceLanguage}-${targetLanguage} words to HTML...`
            );

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
              const canonicalUrl = `${this.options.basePath}/${htmlFilename}`;

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

              compilation.assets[htmlFilename] = {
                source: () => rendered.html,
                size: () => rendered.html.length,
              };
            }
          }

          this.hasBeenBuilt = true;

          callback(null, data);
        }
      );
    });
  }
}

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
