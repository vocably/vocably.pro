import { SubscriptionStatus } from './subscription';

export type UserData = {
  username: string;
  email: string;
  sub: string;
  status?: SubscriptionStatus;
  updateUrl?: string;
  cancelUrl?: string;
  nextBillDate?: Date;
  unitPrice?: number;
  cancellationDate?: Date;
  productId?: number;
  planName?: string;
};

/**
 * Structurally compatible with Amplify's `FetchUserAttributesOutput`, but
 * declared locally so the model stays free of an Amplify dependency.
 */
export type UserAttributes = Partial<Record<string, string>>;

export const mapUserAttributes = ({
  username,
  attributes,
}: {
  username: string;
  attributes: UserAttributes;
}): UserData => {
  const email = attributes['email'];
  const sub = attributes['sub'];

  if (!email || !sub) {
    throw Error('Can find email and sub in user data.');
  }

  const nextBillDate = attributes['custom:next_bill_date'];
  const unitPrice = attributes['custom:unit_price'];
  const cancellationDate = attributes['custom:cancellation_date'];
  const productId = attributes['custom:product_id'];

  return {
    username,
    email,
    sub,
    status: attributes['custom:status'] as SubscriptionStatus | undefined,
    updateUrl: attributes['custom:update_url'],
    cancelUrl: attributes['custom:cancel_url'],
    nextBillDate: nextBillDate ? new Date(nextBillDate) : undefined,
    unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
    cancellationDate: cancellationDate ? new Date(cancellationDate) : undefined,
    productId: productId ? parseInt(productId) : undefined,
    planName: attributes['custom:plan_name'],
  };
};

export const isEligibleForTrial = (userData: UserData): boolean => {
  return userData.status !== 'deleted';
};
