import { inspect } from '@vocably/node-sulna';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { analyzeUnitsOfSpeech } from './index';

// @ts-ignore
let mockEvent: APIGatewayProxyEvent = {};

describe('integration check for analyzeUnitsOfSpeech lambda', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('execute analyzeUnitsOfSpeech lambda', async () => {
    mockEvent.body = JSON.stringify({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      unitsOfSpeech: [
        {
          headword: 'look up',
          partOfSpeech: 'phrasal verb',
        },
        { headword: 'give up', partOfSpeech: 'phrasal verb' },
      ],
    });
    const result = await analyzeUnitsOfSpeech(mockEvent);
    console.log(inspect({ result }));
    expect(result.statusCode).toEqual(200);
  });
});
