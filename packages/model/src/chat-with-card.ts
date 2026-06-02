import { isNumber, isObject } from 'lodash-es';
import { GoogleLanguage } from './language';

export type ChatCard = {
  language: string;
  source: string;
  partOfSpeech: string;
};

export type ChatWithCardPayload = {
  card: ChatCard;
  history: ChatWithCardMessage[];
  preferredLanguage: GoogleLanguage;
};

export type ChatWithCardMessage = {
  role: 'user' | 'assistant';
  timestamp: number;
  message: string;
  interfaceMessage?: string;
};

export type ChatWithCardResult = {
  messages: ChatWithCardMessage[];
};

export const isChatWithCardMessage = (
  something: any
): something is ChatWithCardMessage => {
  return (
    isObject(something) &&
    ['user', 'assistant'].includes(something['role']) &&
    isNumber(something['timestamp'])
  );
};

export const isChatWithCardPayload = (
  something: any
): something is ChatWithCardPayload => {
  return (
    isObject(something) &&
    isObject(something['card']) &&
    Array.isArray(something['history']) &&
    something['history'].every(isChatWithCardMessage)
  );
};
