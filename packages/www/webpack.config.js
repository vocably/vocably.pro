const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackWatchPlugin = require('webpack-watch-files-plugin').default;
const { environment } = require('./environment');
const glob = require('glob');
const { templateOptions } = require('./template-options');
const { indexNowKey } = require('./seo/indexNow');

const pagesDir = `./src/pages`;
const handlebarsExtension = `handlebars`;
const pagesPattern = `**/*${handlebarsExtension}`;

const basePath = 'https://vocably.pro';

// The SEO search pages (/de-en/<word>-in-german.html) are rendered by
// packages/seo-backend. Run `npm run serve` there to see them in development.
const seoLanguagePairs = require('../../scripts/seo/language-pairs.json').map(
  ({ sourceLanguage, targetLanguage }) => `${sourceLanguage}-${targetLanguage}`
);

module.exports = (env) => {
  return {
    mode: env.production ? 'production' : 'development',
    entry: {
      main: './src/index.ts',
      search: './src/search.ts',
      grammar: './src/grammar.ts',
      ai: './src/ai.ts',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s?[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'resolve-url-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  silenceDeprecations: [
                    'import',
                    'color-functions',
                    'if-function',
                    'global-builtin',
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.handlebars$/,
          use: [
            {
              loader: 'handlebars-loader',
              options: {
                partialDirs: [`${__dirname}/src/partials`],
                helperDirs: [`${__dirname}/src/helpers`],
              },
            },
          ],
        },
        { test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/, type: 'asset/resource' },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.png', '.svg'],
    },
    devtool: 'source-map',
    output: {
      chunkFilename: env.production ? '[name].[contenthash].js' : '[name].js',
      filename: env.production ? '[name].[contenthash].js' : '[name].js',
      assetModuleFilename: env.production
        ? '[name].[contenthash][ext][query]'
        : '[name].[ext][query]',
    },
    plugins: [
      ...glob.sync(pagesPattern, { cwd: pagesDir }).map((handlebarsPage) => {
        const pageName = handlebarsPage.replace(`.${handlebarsExtension}`, '');
        const filename = handlebarsPage.replace(handlebarsExtension, 'html');

        let canonicalHref = basePath;

        if (filename !== 'index.html') {
          canonicalHref += `/${filename}`;
        }

        return new HtmlWebpackPlugin({
          template: `${pagesDir}/${handlebarsPage}`,
          filename: filename,
          chunks: ['main', pageName],
          canonicalHref: canonicalHref,
          inject: true,
          favicon: './src/favicon.ico',
          environment: {
            ...environment,
            ...templateOptions,
          },
        });
      }),
      new MiniCssExtractPlugin({
        filename: env.production ? '[name].[contenthash].css' : '[name].css',
      }),
      new CopyPlugin({
        patterns: [{ from: 'src/assets', to: 'assets' }],
      }),
      new CopyPlugin({
        patterns: [{ from: 'src/robots.txt', to: 'robots.txt' }],
      }),
      new CopyPlugin({
        patterns: [
          { from: `src/${indexNowKey}.txt`, to: `${indexNowKey}.txt` },
        ],
      }),
      // Lets iOS offer passwords saved for vocably.pro in the mobile app.
      new CopyPlugin({
        patterns: [{ from: 'src/.well-known', to: '.well-known' }],
      }),
      new WebpackWatchPlugin({
        files: [`${pagesDir}/${pagesPattern}`, './environment.js'],
      }),
    ],
    devServer: {
      port: 8050,
      hot: false,
      liveReload: true,
      proxy: {
        ...Object.fromEntries(
          seoLanguagePairs.map((pair) => [
            `/${pair}/`,
            { target: 'http://localhost:8060' },
          ])
        ),
        '/app': {
          target: 'http://localhost:8030', // the other app's real port
          changeOrigin: true, // rewrites the Host header to match target
          secure: false, // set false if target uses a self-signed https cert
          ws: true, // forward websocket upgrades (needed for HMR)
        },
      },
    },
  };
};
