import { byDate, LanguageDeck, languageList } from '@vocably/model';
import { slice } from '@vocably/srs';
import { trimLanguage } from '@vocably/sulna';
import { first, get, sample } from 'lodash-es';

export type NotificationBody = {
  Title: string;
  Body: string;
};

const inspiringQuotes = [
  'Stay steady, move forward.',
  'Focus on what matters.',
  'Consistency builds success.',
  'Create, learn, grow daily.',
  'Stay curious. Keep moving.',
  'Discipline fuels freedom.',
  'Small steps. Big impact.',
  'Action beats intention.',
  'Patience shapes mastery.',
  'Strength comes quietly.',
  'Grit over glamour.',
  'Create habits, not excuses.',
] as const;

const getGenericBody = (language: string): NotificationBody => {
  const languageName = trimLanguage(get(languageList, language, ''));

  if (!languageName) {
    return {
      Title: sample(inspiringQuotes),
      Body: "It's time to study your cards.",
    };
  }

  return {
    Title: sample(inspiringQuotes),
    Body: `It's time to study your ${languageName} cards.`,
  };
};

export const getBody = (deck: LanguageDeck): NotificationBody => {
  if (deck.tags.length > 0) {
    return getGenericBody(deck.language);
  }

  const card = first(slice(new Date(), 1, 40, deck.cards.sort(byDate)));

  if (!card) {
    return getGenericBody(deck.language);
  }

  // Send generic body so the correct answer is not revealed
  // in the notifications.
  if (card?.data?.state?.s === 'sb' || card?.data?.state?.s === 'mb') {
    return getGenericBody(deck.language);
  }

  const titleCandidate = `Remember "${card.data.source}"?`;

  const languageName = trimLanguage(get(languageList, deck.language, ''));
  const genericBody = languageName
    ? `It's time to study your ${languageName} cards.`
    : `It's time to study your cards.`;

  if (titleCandidate.length <= 30) {
    return {
      Title: titleCandidate,
      Body: genericBody,
    };
  }

  const genericTitle = languageName
    ? `Time for ${languageName}.`
    : `Time to study.`;
  const bodyCandidate = `Still remember "${card.data.source}"?`;
  if (bodyCandidate.length <= 120) {
    return {
      Title: genericTitle,
      Body: bodyCandidate,
    };
  }

  return {
    Title: genericTitle,
    Body: sample(inspiringQuotes),
  };
};
