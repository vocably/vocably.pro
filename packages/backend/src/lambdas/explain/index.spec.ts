import { Analysis, DirectAnalysis, ReverseAnalysis } from '@vocably/model';
import { inspect } from '@vocably/node-sulna';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { explain } from './index';

// @ts-ignore
let mockEvent: APIGatewayProxyEvent = {};

describe('integration check for translate lambda', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('works', async () => {
    mockEvent.body = JSON.stringify({
      sourceLanguage: 'en',
      targetLanguage: 'de',
      source: 'The children were running after the buses',
    });
    const result = await explain(mockEvent);
    console.log(inspect({ result }));
    expect(result.statusCode).toEqual(200);
  });
});
