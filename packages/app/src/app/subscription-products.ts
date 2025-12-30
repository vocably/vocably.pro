import { getPaddleInstance } from '@paddle/paddle-js';
import { environment } from '../environments/environment';

export type SubscriptionProduct = {
  priceId: string;
  duration: string;
  durationUnit: string;
  perMonth: string;
  total: string;
  maxTotal: string;
  title: string;
  trialDays: number;
};

const subscriptionProducts: SubscriptionProduct[] = [
  {
    priceId: environment.paddleMonthlyPriceId,
    duration: '1',
    durationUnit: 'month',
    perMonth: '$4.99',
    total: '$4.99',
    maxTotal: '',
    title: 'Monthly premium',
    trialDays: 7,
  },
  {
    priceId: environment.paddleYearlyPriceId,
    duration: '1',
    durationUnit: 'year',
    perMonth: '$2.50',
    total: '$29.99',
    maxTotal: '$59.88',
    title: 'Yearly premium',
    trialDays: 7,
  },
  {
    priceId: environment.paddleLifetimePriceId,
    duration: 'Lifetime',
    durationUnit: '',
    perMonth: '',
    total: '$59.99',
    maxTotal: '',
    title: 'Lifetime premium',
    trialDays: 0,
  },
];

export const getSubscriptionProducts = async (): Promise<
  SubscriptionProduct[]
> => {
  const Paddle = getPaddleInstance();
  if (!Paddle) {
    return subscriptionProducts;
  }

  const { data } = await Paddle.PricePreview({
    items: subscriptionProducts.map((product) => ({
      priceId: product.priceId,
      quantity: 1,
    })),
  });

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: data.currencyCode,
  });

  data.details.lineItems.forEach((item, index) => {
    subscriptionProducts[index].total = formatter.format(
      Number(item.totals.total) / 100
    );
    if (item.price.trialPeriod) {
      subscriptionProducts[index].trialDays = item.price.trialPeriod.frequency;
    }

    if (index === 1) {
      subscriptionProducts[1].maxTotal = formatter.format(
        (Number(data.details.lineItems[0].price.unitPrice.amount) * 12) / 100
      );
      subscriptionProducts[1].perMonth = formatter.format(
        Math.round(
          Number(data.details.lineItems[1].price.unitPrice.amount) / 12
        ) / 100
      );
    }
  });

  return subscriptionProducts;
};
