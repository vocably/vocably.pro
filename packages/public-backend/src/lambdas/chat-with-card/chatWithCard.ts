import {
  chatGptRequest,
  GPT_4O,
  setOpenAIConfig,
} from '@vocably/lambda-shared';
import {
  ChatWithCardPayload,
  ChatWithCardResult,
  isGoogleLanguage,
  languageList,
  Result,
} from '@vocably/model';

setOpenAIConfig({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatWithCard = async (
  payload: ChatWithCardPayload
): Promise<Result<ChatWithCardResult>> => {
  const language = isGoogleLanguage(payload.card.language)
    ? languageList[payload.card.language]
    : payload.card.language;
  const systemPayload = [
    payload.card.partOfSpeech
      ? `You are a smart language assistant that helps users to better understand the ${language} card that is the ${payload.card.partOfSpeech} "${payload.card.source}".`
      : `You are a smart language assistant that helps users to better understand the ${language} card "${payload.card.source}".`,
    'Only respond to questions related to this card.',
    'Users can ask questions in different languages.',
  ].join('\n');

  const responseResult = await chatGptRequest({
    responseFormat: {
      type: 'text',
    },
    messages: [
      {
        role: 'system',
        content: systemPayload,
      },
      ...payload.history.map((historyItem) => ({
        role: historyItem.role,
        content: historyItem.message,
      })),
    ],
    model: GPT_4O,
    temperature: 2,
  });

  if (responseResult.success === false) {
    return responseResult;
  }

  return {
    success: true,
    value: {
      messages: [
        ...payload.history,
        {
          role: 'assistant',
          message: responseResult.value,
          timestamp: new Date().getTime(),
        },
      ],
    },
  };
};
