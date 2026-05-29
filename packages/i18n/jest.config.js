module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv-flow/config'],
  testMatch: ['**/?(*.)+(spec|test|integration|manual).[jt]s?(x)'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
};
