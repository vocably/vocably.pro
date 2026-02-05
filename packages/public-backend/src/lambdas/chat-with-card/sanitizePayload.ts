import { ChatWithCardPayload, Result } from '@vocably/model';

export const sanitizePayload = (
  payload: Result<ChatWithCardPayload>
): Result<ChatWithCardPayload> => {
  if (payload.success === false) {
    return payload;
  }

  return {
    success: true,
    value: {
      ...payload.value,
      card: {
        ...payload.value.card,
        source: payload.value.card.source.substring(0, 100),
        partOfSpeech: payload.value.card.partOfSpeech.substring(0, 100),
      },
      history: payload.value.history
        .map((historyItem) => ({
          ...historyItem,
          message: historyItem.message.substring(0, 500),
        }))
        .slice(0, 50),
    },
  };
};
