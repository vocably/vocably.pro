import '@vocably/jest';
import { inspect } from '@vocably/node-sulna';
import Anthropic from '@anthropic-ai/sdk';
import {
  getClaudeTranslateBatchItem,
  getClaudeTranslateBatchItemKey,
  handleClaudeTranslateResponse,
  translateWithClaude,
} from './aiFetchPossibleTranslationClaude';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

const toMessage = (
  text: string,
  stop_reason: Anthropic.Message['stop_reason'] = 'end_turn'
): Anthropic.Message =>
  ({
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'claude-sonnet-5-5',
    content: [{ type: 'text', text, citations: null }],
    stop_reason,
    stop_sequence: null,
    usage: {} as Anthropic.Usage,
  }) as unknown as Anthropic.Message;

describe('aiFetchPossibleTranslationClaude batch helpers', () => {
  const payload = {
    sourceLanguage: 'en',
    targetLanguage: 'nl',
    source: 'cover',
  } as const;

  it('builds a batch item with a valid custom_id', () => {
    const item = getClaudeTranslateBatchItem(payload);

    expect(item.custom_id).toMatch(/^[a-zA-Z0-9_-]{1,64}$/);
    expect(item.custom_id).toEqual(getClaudeTranslateBatchItemKey(payload));
    expect(item.params.messages).toEqual([{ role: 'user', content: 'cover' }]);
    expect(item.params.output_config?.format?.type).toEqual('json_schema');
    expect('fallbacks' in item.params).toEqual(false);
  });

  it('produces different keys for different payloads', () => {
    expect(getClaudeTranslateBatchItemKey(payload)).not.toEqual(
      getClaudeTranslateBatchItemKey({ ...payload, targetLanguage: 'de' })
    );
  });

  it('omits part of speech fields for sentences', () => {
    const item = getClaudeTranslateBatchItem({
      ...payload,
      source: 'I cover the table.',
      inputType: 'sentence',
    });
    const schema = item.params.output_config?.format?.schema as any;

    expect(
      Object.keys(schema.properties.translations.items.properties)
    ).toEqual(['translation']);
  });

  it('handles a successful response', () => {
    const result = handleClaudeTranslateResponse(
      toMessage(
        JSON.stringify({
          translations: [
            { translation: 'bedekken', partOfSpeech: 'verb' },
            { translation: 'omslag', partOfSpeech: 'noun' },
          ],
        })
      ),
      payload
    );

    if (result.success === false) {
      throw result;
    }

    expect(result.value[0].target).toEqual('bedekken');
    expect(result.value[0].source).toEqual('cover');
    expect(result.value[0].sourceLanguage).toEqual('en');
    expect(result.value[0].targetLanguage).toEqual('nl');
    expect(result.value.length).toEqual(2);
  });

  it('fails on refusal and truncated responses', () => {
    expect(
      handleClaudeTranslateResponse(toMessage('', 'refusal'), payload).success
    ).toEqual(false);
    expect(
      handleClaudeTranslateResponse(
        toMessage('{"transl', 'max_tokens'),
        payload
      ).success
    ).toEqual(false);
  });

  it('fails on empty translations', () => {
    expect(
      handleClaudeTranslateResponse(
        toMessage(JSON.stringify({ translations: [] })),
        payload
      ).success
    ).toEqual(false);
  });
});

describe('aiFetchPossibleTranslationClaude', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('a word that can have multiple translations', async () => {
    const result = await translateWithClaude({
      sourceLanguage: 'en',
      targetLanguage: 'nl',
      source: 'cover',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    console.log(inspect(result.value));

    expect(result.value.length).toBeGreaterThan(1);
  });

  it('follows the direction of translation', async () => {
    const result = await translateWithClaude({
      sourceLanguage: 'ru',
      targetLanguage: 'en',
      source: 'get along',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    console.log(inspect(result.value));

    expect(result.value.every((e) => /^[a-z ]+$/.test(e.target))).toEqual(true);
  });

  it('1 follows the direction of translation', async () => {
    const result = await translateWithClaude({
      sourceLanguage: 'en',
      targetLanguage: 'de',
      source: 'creative',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    console.log(inspect(result.value));

    expect(result.value.every((e) => /^[a-zö ]+$/.test(e.target))).toEqual(
      true
    );
  });

  it('fills in source and language fields', async () => {
    const result = await translateWithClaude({
      sourceLanguage: 'en',
      targetLanguage: 'nl',
      source: 'cover',
    });

    if (result.success === false) {
      throw result;
    }

    console.log(inspect(result.value));

    const variants =
      'deksel, cover, bedekking, omslag, bedekken, coveren, dekken, hoes, kaft, hoever, dekking, afdekken, omslaan, omvatten';

    expect(result.value[0].target).toHaveSomeOf(variants);
    expect(result.value[0].source).toEqual('cover');
    expect(result.value[0].sourceLanguage).toEqual('en');
    expect(result.value[0].targetLanguage).toEqual('nl');
  });

  it('strips "to" from English verbs', async () => {
    const result = await translateWithClaude({
      sourceLanguage: 'de',
      targetLanguage: 'en',
      source: 'laufen',
    });

    if (result.success === false) {
      throw result;
    }

    console.log(inspect(result.value));

    result.value
      .filter((e) => e.partOfSpeech === 'verb')
      .forEach((e) => {
        expect(e.target).not.toMatch(/^to /i);
      });
  });

  it('returns unique translations', async () => {
    const result = await translateWithClaude({
      sourceLanguage: 'en',
      targetLanguage: 'de',
      source: 'creative',
    });

    if (result.success === false) {
      throw result;
    }

    const keys = result.value.map((e) => e.target + e.partOfSpeech);
    expect(new Set(keys).size).toEqual(keys.length);
    expect(result.value.length).toBeLessThanOrEqual(6);
  });

  it('translates into Chinese with pinyin', async () => {
    const result = await translateWithClaude({
      sourceLanguage: 'en',
      targetLanguage: 'zh',
      source: 'Tuesday',
    });

    if (result.success === false) {
      throw result;
    }

    console.log(inspect(result.value));

    expect(result.value[0].target).toHaveSomeOf('星期二, 周二, 礼拜二');
    expect(result.value[0].transcript).toHaveSomeOf(
      "xīngqī èr, xīngqī'èr, xīngqīèr, zhōu èr, zhōu'èr, zhōuèr, xīng qī èr"
    );
  });
});
