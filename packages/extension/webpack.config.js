const { merge } = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const {
  WatchTimerPlugin,
  replaceDefinitions,
  getEnvironmentVariables,
} = require('@vocably/webpack');
const { basename } = require('path');
const webpack = require('webpack');

const environmentVariables = getEnvironmentVariables();

// Support for building Firefox extension via TARGET_BROWSER env variable
const targetBrowser = process.env.TARGET_BROWSER || 'chrome';
const isFirefox = targetBrowser === 'firefox';
const manifestFile = isFirefox
  ? 'manifest.firefox.json.txt'
  : 'manifest.json.txt';
const outputDir = isFirefox ? 'dist-firefox' : 'dist';

// Firefox needs external-bridge for web page ↔ extension communication
// (Chrome uses externally_connectable instead)
const baseEntries = {
  'content-script': './src/content-script.ts',
  'service-worker': './src/service-worker.ts',
  'play-audio': './src/play-audio.ts',
};

const firefoxEntries = {
  ...baseEntries,
  'external-bridge': './src/external-bridge.ts',
  'firefox-polyfill': './src/firefox-polyfill.ts',
  'popup-frame': './src/popup-frame/popup-frame.ts',
};

const prodConfig = {
  mode: 'production',
  entry: isFirefox ? firefoxEntries : baseEntries,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html?$/,
        loader: 'html-loader',
      },
      // Firefox CSP fix: Replace Function('return this')() with globalThis
      // This is used by lodash-es and webpack runtime to get global object
      ...(isFirefox
        ? [
            {
              test: /\.(m?js|ts)$/,
              loader: 'string-replace-loader',
              options: {
                search: "Function('return this')()",
                replace: 'globalThis',
              },
            },
            {
              test: /\.(m?js|ts)$/,
              loader: 'string-replace-loader',
              options: {
                search: "new Function('return this')()",
                replace: 'globalThis',
              },
            },
          ]
        : []),
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.mjs'],
    // Firefox CSP fix: Replace lodash-es _root.js which uses Function('return this')()
    // with a CSP-safe version that uses globalThis
    alias: isFirefox
      ? {
          'lodash-es/_root.js': path.resolve(
            __dirname,
            'src/lodash-root-fix.ts'
          ),
        }
      : {},
  },
  output: {
    path: path.join(__dirname, outputDir),
    filename: '[name].js',
    clean: true,
    // Firefox CSP fix: use globalThis instead of Function('return this')()
    ...(isFirefox
      ? {
          globalObject: 'globalThis',
          // Fix: Explicit publicPath for Firefox extension
          publicPath: '/',
        }
      : {}),
  },
  plugins: [
    new webpack.BannerPlugin(
      [
        'Hello to whoever is reading this! I think you are cool 🤜🤛',
        '',
        `I did not obfuscate the code to help you better understand it.`,
        `However, I don't know how to disable minification of web components (StencilJS).`,
        `Sorry, I didn't look too hard!`,
        `The code of the entire project is available at:`,
        `https://github.com/vocably/language-learning-tool`,
        '',
      ].join('\n')
    ),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '../extension-popup/dist',
          to: 'popup',
        },
        { from: '.', to: '.', context: 'assets' },
        {
          from: manifestFile,
          to: 'manifest.json',
          context: 'src',
          transform(content) {
            return replaceDefinitions(
              content.toString(),
              environmentVariables.definitions
            );
          },
        },
        { from: 'play-audio.html', to: 'play-audio.html', context: 'src' },
        // Firefox iframe isolation: copy popup-frame.html
        ...(isFirefox
          ? [
              {
                from: 'popup-frame/popup-frame.html',
                to: 'popup-frame.html',
                context: 'src',
              },
            ]
          : []),
      ],
      options: {},
    }),
    new webpack.DefinePlugin(environmentVariables.stringified),
    // Firefox CSP fix: Replace lodash-es _root.js which uses Function('return this')()
    ...(isFirefox
      ? [
          new webpack.NormalModuleReplacementPlugin(
            /lodash-es\/_root\.js$/,
            path.resolve(__dirname, 'src/lodash-root-fix.ts')
          ),
        ]
      : []),
  ],
  performance: {
    hints: false,
  },
  devtool: 'source-map',
  optimization: {
    minimize: false,
  },
};

const devConfig = {
  plugins: [new WatchTimerPlugin(basename(__dirname))],
};

module.exports = (env) => {
  switch (true) {
    case env.development:
      return merge(prodConfig, devConfig);
    case env.production:
      return prodConfig;
    default:
      throw new Error('No matching configuration was found!');
  }
};
