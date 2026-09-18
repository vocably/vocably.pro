import { getUserStaticMetadata } from '@vocably/api';
import { CardsLimit } from '@vocably/model';
import { isInPaidGroup, isSignedIn } from './session';

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
