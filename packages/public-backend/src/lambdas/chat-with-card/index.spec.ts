import { inspect } from '@vocably/node-sulna';
import { chatWithCardFunction } from './index';

// @ts-ignore
let mockEvent: APIGatewayProxyEvent = {};

xdescribe('integration check for chat-with-card lambda', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('it works', async () => {
    mockEvent.body = JSON.stringify({
      card: {
        language: 'nl',
        source: 'aanranden',
        partOfSpeech: 'verb',
      },
      history: [
        {
          role: 'user',
          message: 'дай пару примеров',
          timestamp: new Date().getTime(),
        },
      ],
    });
    const result = await chatWithCardFunction(mockEvent);

    expect(result.statusCode).toEqual(200);
    if (result.statusCode !== 200) {
      return;
    }

    console.log(inspect(JSON.parse(result.body)));
  });
});
