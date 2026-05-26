import { GoogleTTSLanguage, Result } from '@vocably/model';
import { languageToGoogleTranslateLanguage } from '@vocably/model-operations';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import Sound from 'react-native-sound';
import { Sentry } from './BetterSentry';

type PlayingKey = { text: string; language: GoogleTTSLanguage };

type PlaySoundContextValue = {
  play: (text: string, language: GoogleTTSLanguage) => Promise<Result<unknown>>;
  stop: () => void;
  playing: PlayingKey | null;
};

export const PlaySoundContext = createContext<PlaySoundContextValue>({
  play: async () => ({
    success: false,
    reason: 'PlaySoundContainer is missing',
  }),
  stop: () => {},
  playing: null,
});

export const usePlaySound = (): PlaySoundContextValue =>
  useContext(PlaySoundContext);

const loadAudio = (
  text: string,
  language: GoogleTTSLanguage
): Promise<Result<Sound>> => {
  return new Promise((resolve) => {
    const soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${languageToGoogleTranslateLanguage(language)}&client=tw-ob`;
    Sound.setCategory('Playback');

    let settled = false;
    let audio: Sound | null = null;
    const timeout = setTimeout(() => {
      console.log('timeoutout');
      if (!settled) {
        settled = true;
        audio?.release();
        resolve({
          success: false,
          reason: 'Sound loading timed out',
        });
      }
    }, 4000);

    audio = new Sound(soundUrl, '', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (error === null) {
        resolve({
          success: true,
          value: audio,
        });
        return;
      }
      if (error) {
        resolve({
          success: false,
          reason: 'Unable to load sound resource',
        });
        Sentry.captureException(new Error(`Play sound error`), {
          extra: {
            soundUrl,
            error: JSON.stringify(error),
          },
        });
      }
    });
  });
};

const releaseOnAndroid = (audio: Sound) => {
  if (Platform.OS === 'android') {
    audio.release();
  }
};

export const PlaySoundContainer: FC<PropsWithChildren> = ({ children }) => {
  const [playing, setPlaying] = useState<PlayingKey | null>(null);
  const audioRef = useRef<Sound | null>(null);
  const resolverRef = useRef<((value: Result<unknown>) => void) | null>(null);
  // Token bumps on every play() / stop() — any in-flight async work whose
  // captured token no longer matches knows it has been superseded and bails.
  const playTokenRef = useRef(0);

  const stop = useCallback(() => {
    playTokenRef.current += 1;

    if (audioRef.current) {
      const audio = audioRef.current;
      audioRef.current = null;
      if (Platform.OS === 'android') {
        audio.pause(() => {
          audio.release();
        });
      } else {
        audio.stop();
      }
    }

    if (resolverRef.current) {
      const resolver = resolverRef.current;
      resolverRef.current = null;
      resolver({ success: true, value: null });
    }

    setPlaying(null);
  }, []);

  const play = useCallback(
    async (
      text: string,
      language: GoogleTTSLanguage
    ): Promise<Result<unknown>> => {
      // Replace anything currently playing or loading.
      stop();
      const token = ++playTokenRef.current;
      setPlaying({ text, language });

      const loadedAudioResult = await loadAudio(text, language);

      if (token !== playTokenRef.current) {
        if (loadedAudioResult.success) {
          releaseOnAndroid(loadedAudioResult.value);
        }
        return { success: false, reason: 'Play sound was stopped.' };
      }

      if (!loadedAudioResult.success) {
        setPlaying(null);
        return loadedAudioResult;
      }

      const audio = loadedAudioResult.value;
      audioRef.current = audio;

      return new Promise<Result<unknown>>((resolve) => {
        resolverRef.current = resolve;
        audio.play((success) => {
          // A newer play() / stop() already handled cleanup and resolved us.
          if (token !== playTokenRef.current) {
            releaseOnAndroid(audio);
            return;
          }

          releaseOnAndroid(audio);
          audioRef.current = null;
          resolverRef.current = null;
          setPlaying(null);

          if (success) {
            resolve({ success: true, value: null });
          } else {
            resolve({
              success: false,
              reason: 'Play sound ended up with error.',
            });
          }
        });
      });
    },
    [stop]
  );

  return (
    <PlaySoundContext.Provider value={{ play, stop, playing }}>
      {children}
    </PlaySoundContext.Provider>
  );
};
