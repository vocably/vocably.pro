const path = require('path');
const fs = require('fs');

const lambdasFolder = './src/lambdas';

module.exports = {
  mode: 'production',
  optimization: {
    minimize: false,
  },
  entry: Object.fromEntries(
    fs
      .readdirSync(lambdasFolder, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => [entry.name, `${lambdasFolder}/${entry.name}`])
  ),
  // Provided by the Lambda Node.js runtime.
  externals: {
    '@aws-sdk/client-s3': '@aws-sdk/client-s3',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  target: 'node',
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    clean: true,
    filename: '[name].js',
  },
};
