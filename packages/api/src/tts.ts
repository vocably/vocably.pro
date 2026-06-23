import {
  TTSPayload,
  TTSResponse,
  Result,
  isTTSResponse,
  GoogleTTSLanguage,
} from '@vocably/model';
import { request } from '@vocably/model-operations';

type GoogleTTSParams = {
  text: string;
  languageCode: string;
  voiceSuffix: string;
};

const mapToWavenet: Record<
  GoogleTTSLanguage,
  { languageCode: string; voiceSuffix?: string; model?: 'Standard' | 'Wavenet' }
> = {
  ar: { languageCode: 'ar-XA' },
  eu: { languageCode: 'eu-ES', model: 'Standard', voiceSuffix: 'B' },
  bn: { languageCode: 'bn-IN' },
  bg: { languageCode: 'bg-BG', model: 'Standard', voiceSuffix: 'B' },
  ca: { languageCode: 'ca-ES', model: 'Standard', voiceSuffix: 'B' },
  cs: { languageCode: 'cs-CZ' },
  da: { languageCode: 'da-DK' },
  nl: { languageCode: 'nl-NL' },
  no: { languageCode: 'nb-NO' },
  en: { languageCode: 'en-US', voiceSuffix: 'C' },
  'en-GB': { languageCode: 'en-GB' },
  fi: { languageCode: 'fi-FI' },
  fr: { languageCode: 'fr-FR', model: 'Standard', voiceSuffix: 'F' },
  gl: { languageCode: 'gl-ES', model: 'Standard', voiceSuffix: 'B' },
  de: { languageCode: 'de-DE' },
  el: { languageCode: 'el-GR' },
  gu: { languageCode: 'gu-IN' },
  he: { languageCode: 'he-IL' },
  hi: { languageCode: 'hi-IN' },
  hu: { languageCode: 'hu-HU' },
  is: { languageCode: 'is-IS' },
  id: { languageCode: 'id-ID' },
  it: { languageCode: 'it-IT' },
  ja: { languageCode: 'ja-JP' },
  kn: { languageCode: 'kn-IN' },
  ko: { languageCode: 'ko-KR' },
  lv: { languageCode: 'lv-LV', model: 'Standard', voiceSuffix: 'B' },
  lt: { languageCode: 'lt-LT', model: 'Standard', voiceSuffix: 'B' },
  ms: { languageCode: 'ms-MY' },
  ml: { languageCode: 'ml-IN' },
  mr: { languageCode: 'mr-IN' },
  pl: { languageCode: 'pl-PL' },
  pt: { languageCode: 'pt-BR', voiceSuffix: 'D' },
  'pt-PT': { languageCode: 'pt-PT' },
  pa: { languageCode: 'pa-IN' },
  ro: { languageCode: 'ro-RO' },
  ru: { languageCode: 'ru-RU' },
  sr: { languageCode: 'sr-RS', model: 'Standard', voiceSuffix: 'B' },
  sk: { languageCode: 'sk-SK' },
  es: { languageCode: 'es-ES', voiceSuffix: 'C' },
  sv: { languageCode: 'sv-SE' },
  ta: { languageCode: 'ta-IN' },
  te: { languageCode: 'te-IN' },
  th: { languageCode: 'th-TH', model: 'Standard' },
  tr: { languageCode: 'tr-TR' },
  uk: { languageCode: 'uk-UA', voiceSuffix: 'B' },
  vi: { languageCode: 'vi-VN' },
  zh: { languageCode: 'cmn-CN' },
  'zh-TW': { languageCode: 'cmn-TW' },
};

const ttsPayloadToGoogleTtsParams = (payload: TTSPayload): GoogleTTSParams => {
  return {
    text: payload.text,
    ...{
      voiceSuffix: 'A',
      ...mapToWavenet[payload.language],
    },
  };
};

export const tts = async (
  baseUrl: string,
  payload: TTSPayload
): Promise<Result<TTSResponse>> => {
  const response = await request(baseUrl + '/tts', {
    method: 'POST',
    body: JSON.stringify(ttsPayloadToGoogleTtsParams(payload)),
  });

  if (response.success === false) {
    return response;
  }

  if (!isTTSResponse(response.value)) {
    return {
      success: false,
      reason: 'The TTS response is invalid.',
      errorCode: 'TTS_ERROR',
      extra: response.value,
    };
  }

  return response;
};
