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

type NameTheFileOptions = {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
};
const nameTheFile = ({
  word,
  sourceLanguage,
  targetLanguage,
}: NameTheFileOptions) => {
  const targetLanguageName = trimLanguage(languageList[targetLanguage]);
  return (
    `${word} in ${targetLanguageName}`.toLowerCase().replace(/\P{L}/gu, '-') +
    `-${sourceLanguage}-${targetLanguage}`
  );
};

type Options = {
  searchDataFolder: string;
  searchPageFilename: string;
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

            const sourceLanguageShortName = trimLanguage(
              languageList[sourceLanguage]
            );

            const wordResults: Record<string, TranslationCards> = JSON.parse(
              readFileSync(dataFileName, 'utf-8')
            );

            const words = Object.entries(wordResults);

            console.log(
              `Compiling ${words.length} ${sourceLanguage}-${targetLanguage} words to HTML...`
            );

            for (const [word, translationCards] of words) {
              const searchValues = {
                text: word,
                sourceLanguage: sourceLanguage,
                targetLanguage: targetLanguage,
                isReversed: false,
              };
              const rendered = await renderToString(
                templateHtml.replace(
                  '<div id="search"></div>',
                  `<div id="search"><vocably-search-form values='${JSON.stringify(searchValues)}'></vocably-search-form><div class="results-container"><vocably-translation  result='${JSON.stringify(
                    {
                      success: true,
                      value: translationCards,
                    }
                  )}' isLightweight="true" showLanguages="false"></vocably-translation></div></div>`
                ),
                {
                  title: `${word} in ${sourceLanguageShortName} | Vocably`,
                }
              );

              compilation.assets[
                `${nameTheFile({
                  word,
                  sourceLanguage,
                  targetLanguage,
                })}.html`
              ] = {
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
