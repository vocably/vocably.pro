import { useNavigation } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { useContext, useRef } from 'react';
import { OfferingId, presentPaywall } from './presentPaywall';
import { UserMetadataContext } from './UserMetadataContainer';
import { i18n } from './i18n';

export const usePresentPaywall = () => {
  const navigation = useNavigation();
  const paywallIsPresentRef = useRef(false);
  const posthog = usePostHog();

  const { userStaticMetadata } = useContext(UserMetadataContext);

  return async (offeringId: OfferingId = 'mobile-premium') => {
    if (paywallIsPresentRef.current) {
      return;
    }

    paywallIsPresentRef.current = true;

    posthog.capture('paywall-showed', { offeringId });
    const isPaid = await presentPaywall(offeringId, i18n.language, {
      maxCardsInCollection: userStaticMetadata.max_cards,
      maxCardsPerDay: userStaticMetadata.cards_per_day,
    });
    posthog.capture('paywall-closed', { offeringId, isPaid });
    paywallIsPresentRef.current = false;

    if (isPaid) {
      navigation.navigate('PaymentSuccessModal');
      posthog.capture('$set', {
        $set: {
          isPaidOrTrial: true,
        },
      });
    }
  };
};
