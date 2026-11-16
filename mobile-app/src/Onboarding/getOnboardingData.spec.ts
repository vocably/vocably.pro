import { getOnboardingData } from './getOnboardingData';

describe('getOnboardingData', () => {
  it('returns the examples for a supported language pair', () => {
    const data = getOnboardingData('fr', 'uk');

    expect(data.isFallback).toBeFalsy();
    expect(data.welcomeScreenCard.language).toBe('fr');
    expect(data.directTranslationExample).toMatchObject({
      sourceLanguage: 'fr',
      targetLanguage: 'uk',
    });
  });

  it('falls back to English translations for an unsupported target language', () => {
    const data = getOnboardingData('fr', 'ka');

    expect(data.isFallback).toBe(true);
    expect(data.welcomeScreenCard.language).toBe('fr');
    expect(data.directTranslationExample.targetLanguage).toBe('en');
  });

  it('falls back to German examples for an unsupported source language', () => {
    const data = getOnboardingData('ka', 'uk');

    expect(data.isFallback).toBe(true);
    expect(data.welcomeScreenCard.language).toBe('de');
    expect(data.directTranslationExample.targetLanguage).toBe('uk');
  });
});
