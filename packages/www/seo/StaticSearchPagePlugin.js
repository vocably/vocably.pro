'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.StaticSearchPagePlugin = void 0;
const html_webpack_plugin_1 = __importDefault(require('html-webpack-plugin'));
const hydrate_1 = require('@vocably/extension-content-ui/hydrate');
const sulna_1 = require('@vocably/sulna');
const node_fs_1 = require('node:fs');
const model_1 = require('@vocably/model');
const node_path_1 = require('node:path');
const nameTheFile = ({ word, sourceLanguage, targetLanguage }) => {
  const targetLanguageName = (0, sulna_1.trimLanguage)(
    model_1.languageList[targetLanguage]
  );
  return (
    `${sourceLanguage}-${targetLanguage}/` +
    `${word} in ${targetLanguageName}`.toLowerCase().replace(/\P{L}/gu, '-')
  );
};
const buildTitle = ({ word, sourceLanguage }) => {
  const sourceLanguageShortName = (0, sulna_1.trimLanguage)(
    model_1.languageList[sourceLanguage]
  );
  return `"${word}" in ${sourceLanguageShortName} | Vocably`;
};
const buildDescription = ({ word, sourceLanguage }) => {
  const sourceLanguageShortName = (0, sulna_1.trimLanguage)(
    model_1.languageList[sourceLanguage]
  );
  return `"${word}" in ${sourceLanguageShortName} | Vocably - a dictionary for ${sourceLanguageShortName} learners`;
};
const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
const htmlSpecialChars = (str) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
};
class StaticSearchPagePlugin {
  constructor(options) {
    this.hasBeenBuilt = false;
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.compilation.tap('StaticSearchPagePlugin', (compilation) => {
      // Access the hooks provided by HtmlWebpackPlugin
      html_webpack_plugin_1.default
        .getHooks(compilation)
        .beforeEmit.tapAsync('StaticSearchPagePlugin', (data, callback) =>
          __awaiter(this, void 0, void 0, function* () {
            if (
              data.plugin.userOptions.filename !==
              this.options.searchPageFilename
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
                !(0, model_1.isGoogleLanguage)(sourceLanguage) ||
                !(0, model_1.isGoogleLanguage)(targetLanguage)
              ) {
                return callback(
                  Error('Source or target language is not detected'),
                  data
                );
              }
              const wordResults = JSON.parse(
                (0, node_fs_1.readFileSync)(dataFileName, 'utf-8')
              );
              const words = Object.entries(wordResults);
              console.log(
                `Compiling ${words.length} ${sourceLanguage}-${targetLanguage} words to HTML...`
              );
              for (const [word, translationCards] of words) {
                const contentOptions = {
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
                const rendered = yield (0, hydrate_1.renderToString)(
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
          })
        );
    });
  }
}
exports.StaticSearchPagePlugin = StaticSearchPagePlugin;
function getAllFilesSync(dirPath, fileList = []) {
  const files = (0, node_fs_1.readdirSync)(dirPath);
  files.forEach((file) => {
    const filePath = (0, node_path_1.join)(dirPath, file);
    if ((0, node_fs_1.statSync)(filePath).isDirectory()) {
      getAllFilesSync(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}
