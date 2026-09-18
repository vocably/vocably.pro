import { getUserStaticMetadata } from '@vocably/api';
import { CardsLimit } from '@vocably/model';
import { isInPaidGroup, isSignedIn } from '../user';

/**
 * Mirrors `packages/extension-service-worker/src/getCardsLimit.ts` so that the
 * website caps free accounts exactly like the extension does, rather than
 * becoming a way around the limit.
 *
 * Signed out visitors are `'unlimited'` because they cannot add cards at all:
 * `vocably-translation` shows them the sign in cover instead.
 */
export const getCardsLimit = async (): Promise<CardsLimit> => {
  if (!(await isSignedIn())) {
    return 'unlimited';
  }

  if (await isInPaidGroup()) {
    return 'unlimited';
  }

  const staticMetadataResult = await getUserStaticMetadata();

  if (staticMetadataResult.success === false) {
    return 'unlimited';
  }

  if (staticMetadataResult.value.premium) {
    return 'unlimited';
  }

  return {
    maxCards: staticMetadataResult.value.max_cards,
    cardsPerDay: staticMetadataResult.value.cards_per_day,
  };
};
