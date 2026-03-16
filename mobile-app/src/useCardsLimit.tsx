import { CardsLimit, UserStaticMetadata } from '@vocably/model';
import { useContext, useEffect, useState } from 'react';
import { usePremium } from './usePremium';
import { UserMetadataContext } from './UserMetadataContainer';

const getCardsLimit = (
  userStaticMetadata: UserStaticMetadata,
  isPremium: boolean
): CardsLimit => {
  if (isPremium) {
    return 'unlimited';
  }

  return {
    maxCards: userStaticMetadata.max_cards,
    cardsPerDay: userStaticMetadata.cards_per_day,
  };
};

export const useCardsLimit = (): CardsLimit => {
  const isPremium = usePremium();
  const { userStaticMetadata } = useContext(UserMetadataContext);

  const [cardsLimit, setCardsLimit] = useState<CardsLimit>(
    getCardsLimit(userStaticMetadata, isPremium)
  );

  useEffect(() => {
    if (isPremium) {
      setCardsLimit('unlimited');
      return;
    }

    setCardsLimit(getCardsLimit(userStaticMetadata, isPremium));
  }, [userStaticMetadata, isPremium]);

  return cardsLimit;
};
