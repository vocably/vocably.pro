import { loadLanguageDeck, saveLanguageDeck } from '@vocably/api';
import { LanguageDeck, Result } from '@vocably/model';

const syncSingleDeck = async (
  fromDeck: LanguageDeck
): Promise<Result<LanguageDeck>> => {
  const loadDeckResult = await loadLanguageDeck(fromDeck.language);
  if (loadDeckResult.success === false) {
    return loadDeckResult;
  }

  const syncedDeck: LanguageDeck = {
    language: fromDeck.language,
    tags: fromDeck.tags.reduce((acc, fromTag) => {
      if (acc.find((t) => t.id === fromTag.id)) {
        return acc;
      }

      return [...acc, fromTag];
    }, loadDeckResult.value.tags),
    cards: fromDeck.cards.reduce((acc, fromCard) => {
      if (acc.find((t) => t.id === fromCard.id)) {
        return acc;
      }

      return [...acc, fromCard];
    }, loadDeckResult.value.cards),
  };

  const saveResult = await saveLanguageDeck(syncedDeck);
  if (saveResult.success === false) {
    return saveResult;
  }

  return { success: true, value: syncedDeck };
};

export const syncDecks = async (
  decks: LanguageDeck[]
): Promise<Result<LanguageDeck[]>> => {
  const syncResults = await Promise.all(decks.map(syncSingleDeck));
  let syncedDecks: LanguageDeck[] = [];
  let errors: any[] = [];

  syncResults.forEach((result) => {
    if (result.success) {
      syncedDecks.push(result.value);
    } else {
      errors.push(result);
    }
  });

  if (errors.length > 0) {
    return {
      success: false,
      reason: 'Unable to sync all the decks',
      extra: errors,
    };
  }

  return { success: true, value: syncedDecks };
};
