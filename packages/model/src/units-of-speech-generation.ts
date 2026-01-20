import { isSafeObject } from '@vocably/sulna';
import { isObject, isString } from 'lodash-es';
import { AnalysisItem } from './analysis';
import { GoogleLanguage, isGoogleLanguage } from './language';

export type UnitOfSpeech = {
  headword: string;
  partOfSpeech: string;
};

export const isUnitOfSpeech = (data: any): data is UnitOfSpeech => {
  return (
    isSafeObject(data) &&
    typeof data['headword'] === 'string' &&
    typeof data['partOfSpeech'] === 'string'
  );
};

export type UnitOfSpeechGenerationMessageAssistant = {
  role: 'assistant';
  text: string;
  unitsOfSpeech: UnitOfSpeech[];
};

export const isUnitOfSpeechGenerationMessageAssistant = (
  message: any
): message is UnitOfSpeechGenerationMessageAssistant => {
  return (
    isObject(message) &&
    message['role'] === 'assistant' &&
    isString(message['text']) &&
    Array.isArray(message['unitsOfSpeech']) &&
    message['unitsOfSpeech'].every(isUnitOfSpeech)
  );
};

export type UnitOfSpeechGenerationMessageUser = {
  role: 'user';
  text: string;
};

export const isUnitOfSpeechGenerationMessageUser = (
  message: any
): message is UnitOfSpeechGenerationMessageUser => {
  return message['role'] === 'user' && typeof message['text'] === 'string';
};

export type UnitOfSpeechGenerationMessage =
  | UnitOfSpeechGenerationMessageAssistant
  | UnitOfSpeechGenerationMessageUser;

export const isUnitOfSpeechGenerationMessage = (
  message: any
): message is UnitOfSpeechGenerationMessage => {
  return (
    isUnitOfSpeechGenerationMessageAssistant(message) ||
    isUnitOfSpeechGenerationMessageUser(message)
  );
};

export type UnitOfSpeechGenerationPayload = {
  sourceLanguage: GoogleLanguage;
  messages: UnitOfSpeechGenerationMessage[];
};

export const isUnitOfSpeechGenerationPayload = (
  payload: any
): payload is UnitOfSpeechGenerationPayload => {
  return (
    isSafeObject(payload) &&
    Array.isArray(payload['messages']) &&
    payload['messages'].every(isUnitOfSpeechGenerationMessage) &&
    isGoogleLanguage(payload['sourceLanguage'])
  );
};

export type BatchUnitOfSpeechAnalyzePayload = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  unitsOfSpeech: UnitOfSpeech[];
};

export const isBatchUnitOfSpeechAnalyzePayload = (
  payload: any
): payload is BatchUnitOfSpeechAnalyzePayload => {
  return (
    isSafeObject(payload) &&
    isGoogleLanguage(payload['sourceLanguage']) &&
    isGoogleLanguage(payload['targetLanguage']) &&
    Array.isArray(payload['unitsOfSpeech']) &&
    payload['unitsOfSpeech'].every(isUnitOfSpeech)
  );
};

export type BatchUnitOfSpeechAnalysis = {
  items: AnalysisItem[];
  failed: Array<{
    unitOfSpeech: UnitOfSpeech;
    errorCode: string;
  }>;
};
