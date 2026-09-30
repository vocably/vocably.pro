import { Analysis, LanguageDeck } from '@vocably/model';
import { analysisToTranslationCards } from './analysisToTranslationCards';

const analysis: Analysis = {
  source: 'Hund',
  sourceLanguage: 'de',
  targetLanguage: 'en',
  translation: {
    source: 'Hund',
    target: 'dog',
    sourceLanguage: 'de',
    targetLanguage: 'en',
  },
  items: [
    {
      source: 'Hund',
      definitions: ['a domestic animal'],
      translation: 'dog',
      partOfSpeech: 'noun',
    },
  ],
  isDirect: true,
  detectedInputType: 'word',
};

describe('analysisToTranslationCards', () => {
  it('falls back to an empty deck in the source language', () => {
    const result = analysisToTranslationCards(analysis);

    expect(result.deck).toEqual({ language: 'de', cards: [], tags: [] });
    expect(result.explanation).toEqual('');
    expect(result.items).toBe(analysis.items);
    expect(result.isDirect).toEqual(true);
    expect(result.detectedInputType).toEqual('word');
  });

  it('uses the given deck', () => {
    const deck: LanguageDeck = { language: 'de', cards: [], tags: [] };

    expect(analysisToTranslationCards(analysis, deck).deck).toBe(deck);
  });
});
