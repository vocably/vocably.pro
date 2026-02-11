import { inspect } from '@vocably/node-sulna';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { predefinedOptions } from './index';

// @ts-ignore
let mockEvent: APIGatewayProxyEvent = {};

describe('integration check for predefinedOptions lambda', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('execute predefinedOptions lambda', async () => {
    mockEvent.queryStringParameters = {
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    };
    const result = await predefinedOptions(mockEvent);
    console.log(inspect({ result }));
    expect(result.statusCode).toEqual(200);
  });
});
