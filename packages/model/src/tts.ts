import { GoogleTTSLanguage } from './text-to-speech';

export type TTSPayload = {
  text: string;
  language: GoogleTTSLanguage;
};

export type TTSResponse = {
  audioContent: string;
};

export const isTTSResponse = (payload: any): payload is TTSResponse => {
  return typeof payload.audioContent === 'string';
};
