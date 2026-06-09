import { Webhook } from '@puzzmo/revenue-cat-webhook-types';
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
});
