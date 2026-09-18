import { jest } from '@jest/globals';
import { Analysis, DirectAnalysis, ReverseAnalysis } from '@vocably/model';
import { inspect } from '@vocably/node-sulna';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { analyze } from './index';

// @ts-ignore
let mockEvent: APIGatewayProxyEvent = {};

describe('integration check for translate lambda', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('execute translate lambda', async () => {
    mockEvent.body = JSON.stringify({
      source: 'dankjewel',
      targetLanguage: 'en',
    });
    const result = await analyze(mockEvent);
    console.log(inspect({ result }));
    expect(result.statusCode).toEqual(200);
  });

  it('translates texts as is when language does not supported by lexicala', async () => {
    mockEvent.body = JSON.stringify({
      source: 'labas rytas',
      sourceLanguage: 'lt',
      targetLanguage: 'en',
    });
    const result = await analyze(mockEvent);
    console.log({ result });
    expect(result.statusCode).toEqual(200);
    const resultBody = JSON.parse(result.body);
    expect(resultBody.source).toEqual('labas rytas');
    expect(resultBody.translation).toBeDefined();
  });

  it('skips translation when source language equals to target language', async () => {
    mockEvent.body = JSON.stringify({
      source: 'asylum',
      sourceLanguage: 'en',
      targetLanguage: 'en',
    });
    const result = await analyze(mockEvent);
    console.log({ result });
    expect(result.statusCode).toEqual(200);
    const resultBody: Analysis = JSON.parse(result.body);
    expect(resultBody.source).toEqual('asylum');
    expect(resultBody.translation).toBeDefined();
    expect(resultBody.items.length).toBeGreaterThan(0);
    expect(resultBody.items[0].translation).toEqual('');
  });

  it('adds articles and takes translations from lexicala (nl)', async () => {
    mockEvent.body = JSON.stringify({
      source: 'regeling',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });
    const result = await analyze(mockEvent);
    console.log({ result });
    expect(result.statusCode).toEqual(200);
    const resultBody: Analysis = JSON.parse(result.body);
    expect(resultBody.source).toEqual('regeling');
    expect(resultBody.translation).toBeDefined();
    expect(resultBody.items[0].source).toEqual('de regeling');
    expect(resultBody.items[0].translation).toHaveSomeOf(
      'regulation, arrangement, scheme, settlement, adjustment'
    );
  });

  it('adds articles and takes translations from lexicala (de)', async () => {
    mockEvent.body = JSON.stringify({
      source: 'katzen',
      sourceLanguage: 'de',
      targetLanguage: 'en',
    });
    const result = await analyze(mockEvent);
    console.log({ result });
    expect(result.statusCode).toEqual(200);
    const resultBody: Analysis = JSON.parse(result.body);
    expect(resultBody.source.toLowerCase()).toEqual('katzen');
    expect(resultBody.translation).toBeDefined();
    expect(resultBody.items[0].source.toLowerCase()).toEqual('katzen');
    expect(resultBody.items[0].translation).toEqual('cats, felines');

    expect(resultBody.items[1].source).toEqual('die Katze');
    expect(resultBody.items[1].translation).toEqual('cat, kitty, feline');
  });

  it('adds articles and takes translations from google', async () => {
    mockEvent.body = JSON.stringify({
      source: 'regeling',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });
    const result = await analyze(mockEvent);
    console.log({ result });
    expect(result.statusCode).toEqual(200);
    const resultBody: Analysis = JSON.parse(result.body);
    expect(resultBody.source).toEqual('regeling');
    expect(resultBody.translation).toBeDefined();
    expect(resultBody.items.length).toEqual(1);
    expect(resultBody.items[0].source).toEqual('de regeling');
    expect(resultBody.items[0].translation).toHaveSomeOf(
      'регулирование, устройство, положение, схема'
    );
  });

  it('trims article before analyzing', async () => {
    mockEvent.body = JSON.stringify({
      source: 'de regeling',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });
    const result = await analyze(mockEvent);
    console.log({ result });
    expect(result.statusCode).toEqual(200);
    const resultBody: Analysis = JSON.parse(result.body);
    expect(resultBody.source).toEqual('de regeling');
    expect(resultBody.translation).toBeDefined();
    expect(resultBody.items.length).toEqual(1);
    expect(resultBody.items[0].source).toEqual('de regeling');
    expect(resultBody.items[0].translation).toHaveSomeOf(
      'регулирование, устройство, положение, схема'
    );
  });

  it('skips analyze when source is more than one word', async () => {
    mockEvent.body = JSON.stringify({
      source: 'vijf dagen',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });
    const result = await analyze(mockEvent);
    console.log({ result });
    expect(result.statusCode).toEqual(200);
    const resultBody: Analysis = JSON.parse(result.body);
    expect(resultBody.source).toEqual('vijf dagen');
    expect(resultBody.translation).toBeDefined();
    expect(resultBody.translation.target).toEqual('five days');

    expect(resultBody.items[0].source).toEqual('vijf dagen');
    expect(resultBody.items[0].translation).toEqual('five days');
    expect(resultBody.items[0].partOfSpeech).toHaveSomeOf('noun, noun phrase');
  });

  it('performs reverse analyze', async () => {
    mockEvent.body = JSON.stringify({
      target: 'правило',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });
    const result = await analyze(mockEvent);
    expect(result.statusCode).toEqual(200);
    const resultBody: ReverseAnalysis = JSON.parse(result.body);
    console.log(inspect(resultBody));
    expect(resultBody.target).toEqual('правило');
    expect(resultBody.source).toEqual('regel');
    expect(resultBody.translation).toBeDefined();
    expect(resultBody.items[0].source).toEqual('de regel');
    expect(resultBody.items[0].translation).toHaveSomeOf(
      'строка, правило, норма, условие, линия'
    );
    expect(resultBody.items[1].source).toHaveSomeOf('het voorschrift');
  });

  it('should use word dictionary', async () => {
    mockEvent.body = JSON.stringify({
      source: 'etymology',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    const result = await analyze(mockEvent);
    expect(result.statusCode).toEqual(200);
    const resultBody: DirectAnalysis = JSON.parse(result.body);
    console.log(inspect(resultBody));
  });

  it('filters out senseless stuff that can not be translated', async () => {
    mockEvent.body = JSON.stringify({
      source: 'wake',
      sourceLanguage: 'en',
      targetLanguage: 'en',
    });
    const result = await analyze(mockEvent);
    expect(result.statusCode).toEqual(200);
    const resultBody: DirectAnalysis = JSON.parse(result.body);
    console.log(inspect(resultBody));
    expect(resultBody.items.length).toEqual(2);
  });

  it('properly translates dutch to non-article languages', async () => {
    mockEvent.body = JSON.stringify({
      source: 'revalidatie',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });
    const result = await analyze(mockEvent);
    expect(result.statusCode).toEqual(200);
    const resultBody: DirectAnalysis = JSON.parse(result.body);
    console.log(inspect(resultBody));
    expect(resultBody.items.length).toEqual(1);
    expect(resultBody.items[0].translation).toContain('реабилитация');
  });

  it('avoids duplicates in translations', async () => {
    mockEvent.body = JSON.stringify({
      source: 'zijn',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });
    const result = await analyze(mockEvent);
    expect(result.statusCode).toEqual(200);
    const resultBody: DirectAnalysis = JSON.parse(result.body);
    expect(resultBody.items[0].translation).toHaveSomeOf(
      'be, am, is, are, was, were, been'
    );
    expect(resultBody.items[1].translation).toHaveSomeOf('being, existence');
  });

  it('provides context translation', async () => {
    mockEvent.body = JSON.stringify({
      source: 'bank',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      context:
        "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'",
    });
    const result = await analyze(mockEvent);
    expect(result.statusCode).toEqual(200);
    const resultBody: DirectAnalysis = JSON.parse(result.body);
    expect(resultBody.translation.target).toEqual('берег');
  });
});
