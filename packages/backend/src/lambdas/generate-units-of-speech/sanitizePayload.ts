import {
  isUnitOfSpeechGenerationMessageAssistant,
  isUnitOfSpeechGenerationMessageUser,
  UnitOfSpeechGenerationPayload,
} from '@vocably/model';

export const sanitizePayload = (
  payload: UnitOfSpeechGenerationPayload
): UnitOfSpeechGenerationPayload => {
  return {
    ...payload,
    messages: payload.messages
      .map((message) => {
        if (isUnitOfSpeechGenerationMessageUser(message)) {
          return {
            ...message,
            text: message.text.substring(0, 500),
          };
        }

        if (isUnitOfSpeechGenerationMessageAssistant(message)) {
          return {
            ...message,
            text: message.text.substring(0, 500),
            unitsOfSpeech: message.unitsOfSpeech
              .map((unitOfSpeech) => ({
                ...unitOfSpeech,
                headword: unitOfSpeech.headword.substring(0, 100),
                partOfSpeech: unitOfSpeech.partOfSpeech.substring(0, 100),
              }))
              .slice(0, 100),
          };
        }

        return message;
      })
      .slice(0, 50),
  };
};
