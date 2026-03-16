export type CardsLimit =
  | {
      maxCards: number;
      cardsPerDay: number;
    }
  | 'unlimited';

export type UserStaticMetadata = {
  premium: boolean;
  premium_status: string;
  premium_last_event_ms: number;
  premium_expiration_at_ms: number | null;
  max_cards: number;
  cards_per_day: number;
  thanks_trial: 'none' | 'one-year';
  management_url: string | null;
};

export const defaultUserStaticMetadata: UserStaticMetadata = {
  premium: false,
  premium_status: 'NONE',
  premium_expiration_at_ms: null,
  premium_last_event_ms: 0,
  max_cards: 100,
  cards_per_day: 5,
  thanks_trial: 'none',
  management_url: null,
};

export const mergeUserStaticMetadata = (
  md1: UserStaticMetadata,
  md2: Partial<UserStaticMetadata>
): UserStaticMetadata => {
  return {
    ...md1,
    ...md2,
  };
};

export const mapUserStaticMetadata = (metadata: any): UserStaticMetadata => {
  return mergeUserStaticMetadata(defaultUserStaticMetadata, metadata);
};
