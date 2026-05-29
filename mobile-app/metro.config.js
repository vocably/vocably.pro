const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const {
  createSentryMetroSerializer,
} = require('@sentry/react-native/dist/js/tools/sentryMetroSerializer');

const sharedPackages = [
  'api',
  'model',
  'i18n',
  'crud',
  'sulna',
  'srs',
  'model-operations',
];

const buildSharedPackagePath = (package) =>
  path.resolve(__dirname, `../packages/${package}`);

const extraNodeModules = sharedPackages.reduce(
  (result, package) => ({
    ...result,
    [`@vocably/${package}`]: buildSharedPackagePath(package),
  }),
  {}
);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules,
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
  },

  watchFolders: sharedPackages.map(buildSharedPackagePath),

  serializer: {
    customSerializer: createSentryMetroSerializer(),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
