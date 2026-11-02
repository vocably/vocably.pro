import { get } from 'lodash-es';
import { useContext } from 'react';
import { AuthContext, AuthStatus } from './auth/AuthContainer';
import {
  CustomerInfoContext,
  CustomerInfoStatus,
} from './CustomerInfoContainer';

const isPremium = (
  authStatus: AuthStatus,
  customerInfoStatus: CustomerInfoStatus
): boolean => {
  if (authStatus.status === 'logged-in' && authStatus.isPaidGroup) {
    return true;
  }

  if (
    customerInfoStatus.status === 'loaded' &&
    get(
      customerInfoStatus.customerInformation,
      'entitlements.active.premium',
      false
    )
  ) {
    return true;
  }

  return false;
};

export const usePremium = () => {
  const customerInfoStatus = useContext(CustomerInfoContext);
  const authStatus = useContext(AuthContext);

  return isPremium(authStatus, customerInfoStatus);
};

export type PremiumStatus = 'unknown' | 'premium' | 'free';

/**
 * Unlike `usePremium`, tells a free user apart from a user whose subscription
 * hasn't been loaded yet.
 */
export const usePremiumStatus = (): PremiumStatus => {
  const customerInfoStatus = useContext(CustomerInfoContext);
  const authStatus = useContext(AuthContext);

  if (isPremium(authStatus, customerInfoStatus)) {
    return 'premium';
  }

  if (customerInfoStatus.status === 'loaded') {
    return 'free';
  }

  return 'unknown';
};
