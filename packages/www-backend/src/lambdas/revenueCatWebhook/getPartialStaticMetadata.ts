import { Webhook } from '@puzzmo/revenue-cat-webhook-types';
import { UserStaticMetadata } from '@vocably/model';

export const getPartialStaticMetadata = (
  action: Webhook,
  staticMetadata: UserStaticMetadata
): Partial<UserStaticMetadata> => {
  if (staticMetadata.premium_last_event_ms > action.event.event_timestamp_ms) {
    return {};
  }

  let metadata: Partial<UserStaticMetadata> = {
    premium_last_event_ms: action.event.event_timestamp_ms,
  };

  if (
    action.event.type === 'INITIAL_PURCHASE' ||
    action.event.type == 'NON_RENEWING_PURCHASE' ||
    action.event.type == 'RENEWAL'
  ) {
    metadata.premium = true;
  }

  if (
    action.event.type === 'EXPIRATION' ||
    action.event.type === 'CANCELLATION'
  ) {
    metadata.premium = false;
  }

  metadata.premium_status = action.event.type;
  metadata.premium_expiration_at_ms = action.event.expiration_at_ms;

  return metadata;
};
