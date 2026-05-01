import HtmlWebpackPlugin from 'html-webpack-plugin';
import { buildStaticSearchPages } from './buildStaticSearchPages';
import { readFileSync } from 'node:fs';

type Options = {
  searchDataFolder: string;
  searchPageFilename: string;
  basePath: string;
  disabled: boolean;
};

export class StaticSearchPagePlugin {
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
            this.options.disabled ||
            data.plugin.userOptions.filename !== this.options.searchPageFilename
          ) {
            return callback(null, data);
          }

          const pages = await buildStaticSearchPages({
            templateHtml: data.html,
            searchDataFolder: this.options.searchDataFolder,
            basePath: this.options.basePath,
            searchPageFileName: this.options.searchPageFilename,
          });

          for (const page of pages) {
            compilation.assets[page.fileName] = {
              source: () =>
                readFileSync(`./seo/cache/${page.fileName}`, 'utf-8'),
              size: page.size,
            };
          }

          callback(null, data);
        }
      );
    });
  }
}
