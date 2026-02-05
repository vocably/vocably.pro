import { inspect } from '@vocably/node-sulna';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { generateUnitsOfSpeech } from './index';

// @ts-ignore
let mockEvent: APIGatewayProxyEvent = {};

describe('integration check for generate-units-of-speech lambda', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('execute the lambda', async () => {
    mockEvent.body = JSON.stringify({
      sourceLanguage: 'en',
      messages: [
        {
          role: 'user',
          text: 'Most popular phrasal verbs',
        },
      ],
    });
    const result = await generateUnitsOfSpeech(mockEvent);
    console.log(inspect({ result }));
    expect(result.statusCode).toEqual(200);
  });
});
