const path = require('path');
const fs = require('fs');

const lambdasFolder = './src/lambdas';

// The renderer only reads data that already exists in the units-of-speech
// bucket. @vocably/analyze also contains the code that generates that data,
// so every AI and translation SDK it imports is swapped for a stub that throws
// on use. This keeps them out of the bundle and makes an accidental AI call
// fail loudly instead of costing money.
const noAiStub = path.resolve(__dirname, 'src/noAiStub.js');
const aiModules = [
  '@google/genai',
  'openai',
  '@anthropic-ai/sdk',
  '@google-cloud/translate',
  '@google-cloud/text-to-speech',
];

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
    '@aws-sdk/client-cloudfront': '@aws-sdk/client-cloudfront',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: Object.fromEntries(aiModules.map((name) => [name, noAiStub])),
  },
  target: 'node',
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    filename: '[name].js',
  },
};
