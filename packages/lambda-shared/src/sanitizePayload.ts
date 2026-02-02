import {
  AnalyzePayload,
  AudioPronunciationPayload,
  isDirectAnalyzePayload,
  isReverseAnalyzePayload,
} from '@vocably/model';

export const sanitizeAnalyzePayload = (
  payload: AnalyzePayload
): AnalyzePayload => {
  if (isDirectAnalyzePayload(payload)) {
    return {
      ...payload,
      source: payload.source.substring(0, 1000),
      context: payload.context ? payload.context.substring(0, 1000) : undefined,
    };
  } else if (isReverseAnalyzePayload(payload)) {
    return {
      ...payload,
      target: payload.target.substring(0, 1000),
    };
  }

  return payload;
};

export const sanitizeAudioPronunciationPayload = (
  payload: AudioPronunciationPayload
): AudioPronunciationPayload => {
  return {
    ...payload,
    text: payload.text.substring(0, 1000),
  };
};
