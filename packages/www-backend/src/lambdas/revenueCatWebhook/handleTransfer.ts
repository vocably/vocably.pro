import {
  nodeFetchUserStaticMetadata,
  nodeSaveUserStaticMetadata,
} from '@vocably/lambda-shared';
import { getSubByAliases } from '../../utils/getSubByAliases';
import { checkSandboxSub } from './checkSandboxSub';

/**
 * Not covered by @puzzmo/revenue-cat-webhook-types.
 * @see https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields#transfer
 */
export type TransferEvent = {
  type: 'TRANSFER';
  id: string;
  app_id: string;
  environment: 'PRODUCTION' | 'SANDBOX';
  event_timestamp_ms: number;
  store: string;
  transferred_from: string[];
  transferred_to: string[];
};

export const isTransferEvent = (event: unknown): event is TransferEvent =>
  (event as TransferEvent)?.type === 'TRANSFER';

type TransferOutcome = {
  sub: string;
  status: 'granted' | 'revoked' | 'skipped' | 'error';
  reason?: string;
};

const resolveSubs = async (appUserIds: string[]): Promise<string[]> => {
  const subs: string[] = [];
  for (const appUserId of appUserIds) {
    if (
      appUserId.startsWith('$RCAnonymousID') ||
      appUserId.startsWith('eu-central-1')
    ) {
      continue;
    }
    const result = await getSubByAliases([appUserId]);
    if (result.success && !subs.includes(result.value)) {
      subs.push(result.value);
    }
  }
  return subs;
};

const setPremium = async (
  sub: string,
  premium: boolean,
  event: TransferEvent
): Promise<TransferOutcome> => {
  if (event.environment === 'SANDBOX') {
    const sandboxCheck = await checkSandboxSub(sub);
    if (sandboxCheck.success === false) {
      return { sub, status: 'skipped', reason: sandboxCheck.reason };
    }
  }

  const staticMetadataResult = await nodeFetchUserStaticMetadata(
    sub,
    process.env.STATIC_USER_FILES_BUCKET
  );

  if (staticMetadataResult.success === false) {
    console.error('Fetch static metadata error', staticMetadataResult);
    return {
      sub,
      status: 'error',
      reason: 'Unable to fetch user static metadata.',
    };
  }

  if (
    staticMetadataResult.value.premium_last_event_ms > event.event_timestamp_ms
  ) {
    return {
      sub,
      status: 'skipped',
      reason: 'Static metadata has a newer premium event.',
    };
  }

  const saveResult = await nodeSaveUserStaticMetadata(
    sub,
    process.env.STATIC_USER_FILES_BUCKET,
    {
      premium,
      premium_status: event.type,
      premium_last_event_ms: event.event_timestamp_ms,
      // TRANSFER carries no expiration date for the receiving user
      ...(premium ? { premium_expiration_at_ms: null } : {}),
    }
  );

  if (saveResult.success === false) {
    console.error('Save metadata error', saveResult);
    return {
      sub,
      status: 'error',
      reason: 'Unable to save static metadata.',
    };
  }

  return { sub, status: premium ? 'granted' : 'revoked' };
};

/**
 * Subscriptions moved from the `transferred_from` users to the
 * `transferred_to` users: the former lose premium, the latter get it.
 * A user present on both sides keeps premium.
 */
export const handleTransfer = async (
  event: TransferEvent
): Promise<{ success: boolean; outcomes: TransferOutcome[] }> => {
  const toSubs = await resolveSubs(event.transferred_to ?? []);
  const fromSubs = (await resolveSubs(event.transferred_from ?? [])).filter(
    (sub) => !toSubs.includes(sub)
  );

  const outcomes: TransferOutcome[] = [];

  for (const sub of fromSubs) {
    outcomes.push(await setPremium(sub, false, event));
  }

  for (const sub of toSubs) {
    outcomes.push(await setPremium(sub, true, event));
  }

  return {
    success: outcomes.every((outcome) => outcome.status !== 'error'),
    outcomes,
  };
};
