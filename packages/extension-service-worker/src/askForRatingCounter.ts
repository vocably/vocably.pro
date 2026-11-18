import { loadLanguageDeck } from '@vocably/api';
import { GoogleLanguage } from '@vocably/model';
import { browserEnv } from './browserEnv';
import { isSignedIn } from './session';

const storage = browserEnv.storage.sync;
const storageKey = 'askForRatingCounter';

export const getAskForRatingCounter = async (
  language: GoogleLanguage
): Promise<number> => {
  const storageResult = await storage.get([storageKey]);

  if (storageResult[storageKey] !== undefined) {
    return storageResult[storageKey];
  }

  if (!(await isSignedIn())) {
    await storage.set({ [storageKey]: 1 });
    return 1;
  }

  const languageDeckResult = await loadLanguageDeck(language);

  if (languageDeckResult.success === false) {
    return 1;
  }

  const newValue =
    languageDeckResult.value.cards.length >= 10
      ? 10
      : languageDeckResult.value.cards.length;
  await storage.set({ [storageKey]: newValue });

  return newValue;
};

export const storeAskForRatingCounter = async (newCounterValue: number) => {
  await storage.set({ [storageKey]: newCounterValue });
};

export const resetAskForRatingCounter = async () => {
  await storage.set({ [storageKey]: 1 });
};
