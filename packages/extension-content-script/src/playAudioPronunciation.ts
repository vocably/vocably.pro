import { AudioPronunciationPayload, Result } from '@vocably/model';
import { api } from './api';

const playError = (e: unknown): Result<true> => ({
  success: false,
  errorCode: 'UNABLE_TO_PLAY_AUDIO_DATA_URL',
  reason: 'An error occurred while playing the offscreen audio',
  extra: e,
});

let audioContext: AudioContext | undefined;

// Created and resumed synchronously inside the click handler, so the user
// gesture unlocks it before any async message passing happens.
const prepareAudioContext = (): AudioContext | undefined => {
  try {
    const AudioContextClass: typeof AudioContext | undefined =
      window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return undefined;
    }
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  } catch {
    return undefined;
  }
};

const dataUrlToArrayBuffer = (dataUrl: string): ArrayBuffer => {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Web Audio does not load a URL, so it is not subject to the page's
// media-src CSP (Safari applies page CSP to content scripts).
const playWithWebAudio = async (
  context: AudioContext,
  dataUrl: string
): Promise<Result<true>> => {
  try {
    if (context.state === 'suspended') {
      await context.resume();
    }
    const buffer = await new Promise<AudioBuffer>((resolve, reject) =>
      context.decodeAudioData(dataUrlToArrayBuffer(dataUrl), resolve, reject)
    );
    return await new Promise((resolve) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.addEventListener('ended', () =>
        resolve({ success: true, value: true })
      );
      source.start();
    });
  } catch (e) {
    return playError(e);
  }
};

const playWithAudioElement = async (dataUrl: string): Promise<Result<true>> => {
  return await new Promise((resolve) => {
    try {
      const audio = new Audio(dataUrl);
      audio.addEventListener('ended', () => {
        resolve({
          success: true,
          value: true,
        });
      });
      audio.play().catch((e) => resolve(playError(e)));
    } catch (e) {
      resolve(playError(e));
    }
  });
};

let canPlayOffScreenCache: boolean | undefined;

export const playAudioPronunciation = async (
  payload: AudioPronunciationPayload
): Promise<Result<true>> => {
  // Must happen before the first await to keep the user gesture.
  const preparedContext =
    canPlayOffScreenCache === true ? undefined : prepareAudioContext();

  const canPlayOffScreen = await api.canPlayOffScreen();
  canPlayOffScreenCache = canPlayOffScreen;
  if (canPlayOffScreen) {
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = undefined;
    }
    return api.playAudioPronunciation(payload);
  }

  const result = await api.getAudioPronunciation(payload);

  if (result.success === false) {
    return result;
  }

  const context = preparedContext ?? prepareAudioContext();
  if (context) {
    const webAudioResult = await playWithWebAudio(context, result.value.url);
    if (webAudioResult.success === true) {
      return webAudioResult;
    }
  }

  return playWithAudioElement(result.value.url);
};
