import Purchases from 'react-native-purchases';
import RevenueCatUI, {
  CustomVariableValue,
  PAYWALL_RESULT,
} from 'react-native-purchases-ui';
import { CardsLimit } from '@vocably/model';

export type OfferingId =
  | 'mobile-premium'
  | 'mobile-premium-1-free'
  | 'mobile-premium-add-card';

export const presentPaywall = async (
  offeringId: OfferingId = 'mobile-premium',
  variables: {
    maxCardsInCollection: number;
    maxCardsPerDay: number;
  }
): Promise<boolean> => {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.all[offeringId];

  // Present paywall for current offering:
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
    offering: offering,
    customVariables: {
      maxCardsInCollection: CustomVariableValue.string(
        variables.maxCardsInCollection.toString()
      ),
      maxCardsPerDay: CustomVariableValue.string(
        variables.maxCardsPerDay.toString()
      ),
    },
  });

  switch (paywallResult) {
    case PAYWALL_RESULT.NOT_PRESENTED:
    case PAYWALL_RESULT.ERROR:
    case PAYWALL_RESULT.CANCELLED:
      return false;
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      return true;
    default:
      return false;
  }
};
