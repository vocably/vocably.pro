import { isObject, isString } from 'lodash-es';
import { GoogleLanguage, isGoogleLanguage } from './language';
import { UnitOfSpeech } from './units-of-speech-generation';

export type ExplainPayload = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  source: string;
};

export type Explanation = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  explanation: string;
  unitsOfSpeech: UnitOfSpeech[];
};

export const isExplainPayload = (data: any): data is ExplainPayload => {
  if (!isObject(data)) {
    return false;
  }

  if (!isGoogleLanguage(data['sourceLanguage'])) {
    return false;
  }

  if (!isGoogleLanguage(data['targetLanguage'])) {
    return false;
  }

  if (!isString(data['source'])) {
    return false;
  }

  return true;
};
