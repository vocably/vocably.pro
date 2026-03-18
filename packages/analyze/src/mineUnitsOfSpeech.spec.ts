import '@vocably/jest';
import { mineUnitsOfSpeech } from './mineUnitsOfSpeech';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

describe('mineUnitsOfSpeech', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  jest.setTimeout(30000);

  beforeAll(() => {
    configureTestAnalyzer();
  });

  it('should extract normalized units of speech from a sentence', async () => {
    const result = await mineUnitsOfSpeech({
      sourceLanguage: 'en',
      targetLanguage: 'de',
      source: 'The children were running after the buses',
    });

    expect(result.success).toEqual(true);
    if (!result.success) return;

    expect(result.value.length).toBeGreaterThan(0);

    const headwords = result.value.map((u) => u.headword.toLowerCase());

    expect(headwords).toContain('child');
    expect(headwords).toContain('run');
    expect(headwords).toContain('bus');
  });

  it('should detect phrasal verbs', async () => {
    const result = await mineUnitsOfSpeech({
      sourceLanguage: 'en',
      targetLanguage: 'de',
      source: 'She gave up smoking and took off her coat',
    });

    expect(result.success).toEqual(true);
    if (!result.success) return;

    const entries = result.value.map((u) => u.headword.toLowerCase());
    const partsOfSpeech = result.value.map((u) => u.partOfSpeech.toLowerCase());

    expect(entries).toContain('give up');
    expect(entries).toContain('take off');
    expect(partsOfSpeech).toContain('phrasal verb');
  });

  it('should detect idioms', async () => {
    const result = await mineUnitsOfSpeech({
      sourceLanguage: 'en',
      targetLanguage: 'de',
      source: 'He kicked the bucket after beating around the bush for years',
    });

    expect(result.success).toEqual(true);
    if (!result.success) return;

    const entries = result.value.map((u) => u.headword.toLowerCase());

    expect(entries).toContain('kick the bucket');
    expect(entries).toContain('beat around the bush');
  });

  it('should work with non-English source language', async () => {
    const result = await mineUnitsOfSpeech({
      sourceLanguage: 'de',
      targetLanguage: 'en',
      source: 'Die Kinder liefen durch die Straßen',
    });

    expect(result.success).toEqual(true);
    if (!result.success) return;

    expect(result.value.length).toBeGreaterThan(0);

    const headwords = result.value.map((u) => u.headword.toLowerCase());

    expect(headwords).toContain('kind');
    expect(headwords).toContain('laufen');
    expect(headwords).toContain('straße');
  });
});
