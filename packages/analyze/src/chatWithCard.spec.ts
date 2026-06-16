import { inspect } from '@vocably/node-sulna';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';
import { chatWithCard } from './chatWithCard';

configureTestAnalyzer();

describe('chatWithCard', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('works', async () => {
    const result = await chatWithCard({
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
      preferredLanguage: 'uk',
    });

    console.log(inspect(result));

    expect(result.success).toEqual(true);
    if (!result.success) {
      return;
    }
  });
});
