import '@vocably/jest';
import { inspect } from '@vocably/node-sulna';
import { generateUnitsOfSpeech } from './generateUnitsOfSpeech';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

describe('generateUnitsOfSpeech', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('phrasal verbs en', async () => {
    const result = await generateUnitsOfSpeech({
      sourceLanguage: 'en',
      messages: [
        {
          role: 'user',
          text: 'Most popular phrasal verbs',
        },
      ],
    });

    if (!result.success) {
      console.log({ inappropriateResult: result });
      throw new Error('Failed to generate cards');
    }

    console.log('Units of speech', inspect(result.value.unitsOfSpeech));

    expect(result.value.unitsOfSpeech.length).toBeGreaterThanOrEqual(10);
  });

  it('avoids duplicates', async () => {
    const previous = [
      { headword: 'break up', partOfSpeech: 'phrasal verb' },
      { headword: 'call off', partOfSpeech: 'phrasal verb' },
      { headword: 'calm down', partOfSpeech: 'phrasal verb' },
      { headword: 'carry on', partOfSpeech: 'phrasal verb' },
      { headword: 'check out', partOfSpeech: 'phrasal verb' },
      { headword: 'come across', partOfSpeech: 'phrasal verb' },
      { headword: 'come on', partOfSpeech: 'phrasal verb' },
      { headword: 'come up with', partOfSpeech: 'phrasal verb' },
      { headword: 'cut off', partOfSpeech: 'phrasal verb' },
    ];
    const result = await generateUnitsOfSpeech({
      sourceLanguage: 'en',
      messages: [
        {
          role: 'user',
          text: 'Most popular phrasal verbs',
        },
        {
          role: 'assistant',
          unitsOfSpeech: previous,
        },
        {
          role: 'user',
          text: 'More',
        },
      ],
    });

    if (!result.success) {
      console.log({ inappropriateResult: result });
      throw new Error('Failed to generate cards');
    }

    console.log('Units of speech', inspect(result.value.unitsOfSpeech));

    // The model does not provide the previous units of speech
    expect(
      result.value.unitsOfSpeech.every(
        (unitOfSpeech) =>
          !previous.find((u) => u.headword === unitOfSpeech.headword)
      )
    ).toEqual(true);
  });

  it('non-english', async () => {
    const result = await generateUnitsOfSpeech({
      sourceLanguage: 'nl',
      messages: [
        {
          role: 'user',
          text: 'Most popular irregular verbs',
        },
      ],
    });

    if (!result.success) {
      console.log({ inappropriateResult: result });
      throw new Error('Failed to generate cards');
    }

    console.log('Units of speech', inspect(result.value.unitsOfSpeech));

    expect(result.value.unitsOfSpeech.length).toBeGreaterThanOrEqual(10);
    expect(
      result.value.unitsOfSpeech.find((u) => u.headword === 'zijn')
    ).not.toBeUndefined();
  });
});
