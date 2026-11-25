import { jest } from '@jest/globals';
import { Webhook } from '@puzzmo/revenue-cat-webhook-types';
import { nodeFetchUserStaticMetadata } from '@vocably/lambda-shared';
import { inspect } from '@vocably/node-sulna';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { revenueCatWebhook } from './index';

// @ts-ignore
let mockEvent: APIGatewayProxyEvent = {
  headers: {},
};

describe('integration check for revenue cat webhook lambda', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('exits when auth header is missing', async () => {
    const result = await revenueCatWebhook(mockEvent);
    expect(result.statusCode).toEqual(401);
  });

  it('execute lambda', async () => {
    mockEvent.headers.Authorization =
      process.env.REVENUE_CAT_AUTHORIZATION_HEADER;

    const initialPurchase: Webhook = {
      event: {
        renewal_number: 1,
        event_timestamp_ms: 1658726378679,
        product_id: 'com.subscription.weekly',
        period_type: 'NORMAL',
        purchased_at_ms: 1658726374000,
        expiration_at_ms: 1659331174000,
        environment: 'PRODUCTION',
        entitlement_id: null,
        entitlement_ids: ['premium'],
        presented_offering_id: null,
        transaction_id: '123456789012345',
        original_transaction_id: '123456789012345',
        is_family_share: false,
        country_code: 'US',
        app_user_id: 'test_dev@vocably.pro',
        aliases: [
          '$RCAnonymousID:8069238d6049ce87cc529853916d624c',
          'test_dev@vocably.pro',
        ],
        original_app_user_id: '$RCAnonymousID:87c6049c58069238dce29853916d624c',
        currency: 'USD',
        price: 4.99,
        price_in_purchased_currency: 4.99,
        subscriber_attributes: {
          $email: {
            updated_at_ms: 1662955084635,
            value: 'firstlast@gmail.com',
          },
        },
        store: 'APP_STORE',
        takehome_percentage: 0.7,
        offer_code: null,
        type: 'INITIAL_PURCHASE',
        id: '12345678-1234-1234-1234-123456789012',
        app_id: '1234567890',
      },
      api_version: '1.0',
    };

    mockEvent.body = JSON.stringify(initialPurchase);
    const result = await revenueCatWebhook(mockEvent);
    console.log(inspect({ result }));
    expect(result.statusCode).toEqual(200);
  });

  it('respects sub', async () => {
    mockEvent.headers.Authorization =
      process.env.REVENUE_CAT_AUTHORIZATION_HEADER;

    const initialPurchase: Webhook = {
      event: {
        renewal_number: 1,
        event_timestamp_ms: 1658726378679,
        product_id: 'com.subscription.weekly',
        period_type: 'NORMAL',
        purchased_at_ms: 1658726374000,
        expiration_at_ms: 1659331174000,
        environment: 'PRODUCTION',
        entitlement_id: null,
        entitlement_ids: ['premium'],
        presented_offering_id: null,
        transaction_id: '123456789012345',
        original_transaction_id: '123456789012345',
        is_family_share: false,
        country_code: 'US',
        app_user_id: '21ab1246-38ef-44e1-82aa-aa3262a43b69',
        aliases: [
          '$RCAnonymousID:8069238d6049ce87cc529853916d624c',
          '00000000-38ef-44e1-82aa-aa3262a43b69',
          '21ab1246-38ef-44e1-82aa-aa3262a43b69', // Valid dev sub
        ],
        original_app_user_id: '$RCAnonymousID:87c6049c58069238dce29853916d624c',
        currency: 'USD',
        price: 4.99,
        price_in_purchased_currency: 4.99,
        subscriber_attributes: {
          $email: {
            updated_at_ms: 1662955084635,
            value: 'firstlast@gmail.com',
          },
        },
        store: 'APP_STORE',
        takehome_percentage: 0.7,
        offer_code: null,
        type: 'INITIAL_PURCHASE',
        id: '12345678-1234-1234-1234-123456789012',
        app_id: '1234567890',
      },
      api_version: '1.0',
    };

    mockEvent.body = JSON.stringify(initialPurchase);
    const result = await revenueCatWebhook(mockEvent);
    console.log(inspect({ result }));
    expect(result.statusCode).toEqual(200);
  });

  describe('TRANSFER', () => {
    const validSub = '21ab1246-38ef-44e1-82aa-aa3262a43b69'; // Valid dev sub
    const guestIdentityId = 'eu-central-1:652a87a8-2f87-caf0-b102-0f7f20cd00a0';
    const anonymousId = '$RCAnonymousID:7b58c76deb354f258606447a562a3f61';

    const buildTransfer = (
      transferred_from: string[],
      transferred_to: string[],
      event_timestamp_ms: number
    ) => ({
      api_version: '1.0',
      event: {
        app_id: 'appe90ea5defd',
        environment: 'PRODUCTION',
        event_timestamp_ms,
        id: 'BB32E962-D113-4AE0-93F5-0D02A013B2EE',
        store: 'APP_STORE',
        subscriber_attributes: {},
        transferred_from,
        transferred_to,
        type: 'TRANSFER',
      },
    });

    const purchasePremium = async (event_timestamp_ms: number) => {
      const initialPurchase: Webhook = {
        event: {
          renewal_number: 1,
          event_timestamp_ms,
          product_id: 'com.subscription.weekly',
          period_type: 'NORMAL',
          purchased_at_ms: event_timestamp_ms,
          expiration_at_ms: event_timestamp_ms + 7 * 24 * 60 * 60 * 1000,
          environment: 'PRODUCTION',
          entitlement_id: null,
          entitlement_ids: ['premium'],
          presented_offering_id: null,
          transaction_id: '123456789012345',
          original_transaction_id: '123456789012345',
          is_family_share: false,
          country_code: 'US',
          app_user_id: validSub,
          aliases: [validSub],
          original_app_user_id: validSub,
          currency: 'USD',
          price: 4.99,
          price_in_purchased_currency: 4.99,
          subscriber_attributes: {},
          store: 'APP_STORE',
          takehome_percentage: 0.7,
          offer_code: null,
          type: 'INITIAL_PURCHASE',
          id: '12345678-1234-1234-1234-123456789012',
          app_id: '1234567890',
        },
        api_version: '1.0',
      };

      mockEvent.body = JSON.stringify(initialPurchase);
      const result = await revenueCatWebhook(mockEvent);
      expect(result.statusCode).toEqual(200);

      const metadataResult = await nodeFetchUserStaticMetadata(
        validSub,
        process.env.STATIC_USER_FILES_BUCKET
      );
      expect(metadataResult.success).toEqual(true);
      expect(metadataResult.success && metadataResult.value.premium).toEqual(
        true
      );
    };

    const fetchPremium = async () => {
      const metadataResult = await nodeFetchUserStaticMetadata(
        validSub,
        process.env.STATIC_USER_FILES_BUCKET
      );
      expect(metadataResult.success).toEqual(true);
      return metadataResult.success && metadataResult.value.premium;
    };

    beforeEach(() => {
      mockEvent.headers.Authorization =
        process.env.REVENUE_CAT_AUTHORIZATION_HEADER;
    });

    it('revokes premium from subs that are not in transferred_to', async () => {
      const now = Date.now();
      await purchasePremium(now);

      mockEvent.body = JSON.stringify(
        buildTransfer(
          [guestIdentityId, anonymousId, validSub],
          ['038478c2-6061-7092-5541-ba25625c0839'],
          now + 1
        )
      );
      const result = await revenueCatWebhook(mockEvent);
      console.log(inspect({ result }));

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        outcomes: [{ sub: validSub, status: 'revoked' }],
      });
      expect(await fetchPremium()).toEqual(false);
    });

    it('keeps premium for subs that are also in transferred_to', async () => {
      const now = Date.now();
      await purchasePremium(now);

      mockEvent.body = JSON.stringify(
        buildTransfer([anonymousId, validSub], [validSub], now + 1)
      );
      const result = await revenueCatWebhook(mockEvent);

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        outcomes: [{ sub: validSub, status: 'granted' }],
      });
      expect(await fetchPremium()).toEqual(true);
    });

    it('grants premium to subs in transferred_to', async () => {
      const now = Date.now();
      await purchasePremium(now);

      // Take premium away first
      mockEvent.body = JSON.stringify(
        buildTransfer([validSub], [anonymousId], now + 1)
      );
      await revenueCatWebhook(mockEvent);
      expect(await fetchPremium()).toEqual(false);

      mockEvent.body = JSON.stringify(
        buildTransfer([guestIdentityId, anonymousId], [validSub], now + 2)
      );
      const result = await revenueCatWebhook(mockEvent);

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        outcomes: [{ sub: validSub, status: 'granted' }],
      });

      const metadataResult = await nodeFetchUserStaticMetadata(
        validSub,
        process.env.STATIC_USER_FILES_BUCKET
      );
      expect(metadataResult.success).toEqual(true);
      if (metadataResult.success) {
        expect(metadataResult.value.premium).toEqual(true);
        expect(metadataResult.value.premium_status).toEqual('TRANSFER');
        expect(metadataResult.value.premium_expiration_at_ms).toEqual(null);
      }
    });

    it('ignores transfers older than the last premium event', async () => {
      const now = Date.now();
      await purchasePremium(now);

      mockEvent.body = JSON.stringify(
        buildTransfer([validSub], [anonymousId], now - 1)
      );
      const result = await revenueCatWebhook(mockEvent);

      expect(result.statusCode).toEqual(200);
      const { outcomes } = JSON.parse(result.body);
      expect(outcomes.length).toEqual(1);
      expect(outcomes[0].sub).toEqual(validSub);
      expect(outcomes[0].status).toEqual('skipped');
      expect(await fetchPremium()).toEqual(true);
    });

    it('does nothing when transferred_from has no subs', async () => {
      mockEvent.body = JSON.stringify(
        buildTransfer(
          [guestIdentityId, anonymousId],
          ['038478c2-6061-7092-5541-ba25625c0839'],
          Date.now()
        )
      );
      const result = await revenueCatWebhook(mockEvent);

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        outcomes: [],
      });
    });
  });
});
