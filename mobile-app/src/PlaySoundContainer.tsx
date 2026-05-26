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
import RNBlobUtil from 'react-native-blob-util';
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

type LoadedAudio = { audio: Sound };

const loadAudio = async (
  text: string,
  language: GoogleTTSLanguage
): Promise<Result<LoadedAudio>> => {
  return new Promise(async (resolve) => {
    const soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${languageToGoogleTranslateLanguage(language)}&client=tw-ob`;

    const localPath = `${RNBlobUtil.fs.dirs.CacheDir}/vocably_tts_${Date.now()}.mp3`;

    RNBlobUtil.fs.ls(RNBlobUtil.fs.dirs.CacheDir).then(async (files) => {
      for (const file of files) {
        if (file.startsWith(`vocably_tts_`)) {
          try {
            await RNBlobUtil.fs.unlink(
              `${RNBlobUtil.fs.dirs.CacheDir}/${file}`
            );
          } catch (unlinkError) {
            Sentry.captureException(new Error('Play sound unlink error'), {
              extra: { file, error: JSON.stringify(unlinkError) },
            });
          }
        }
      }
    });

    Sound.setCategory('Playback');

    let audio: Sound | null = null;

    try {
      await RNBlobUtil.config({ path: localPath, timeout: 4000 }).fetch(
        'GET',
        soundUrl
      );
    } catch (downloadError) {
      resolve({ success: false, reason: 'Unable to download sound resource' });
      return;
    }

    audio = new Sound(localPath, '', (error: any) => {
      if (error === null) {
        resolve({ success: true, value: { audio: audio as Sound } });
        return;
      }

      RNBlobUtil.fs.unlink(localPath).catch(() => {});
      resolve({ success: false, reason: 'Unable to load sound resource' });
      Sentry.captureException(new Error('Play sound error'), {
        extra: { localPath, error: JSON.stringify(error) },
      });
    });
  });
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
        audio.stop(() => {
          audio.release();
        });
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
          const { audio } = loadedAudioResult.value;
          audio.release();
        }
        return { success: false, reason: 'Play sound was stopped.' };
      }

      if (!loadedAudioResult.success) {
        setPlaying(null);
        return loadedAudioResult;
      }

      const { audio } = loadedAudioResult.value;
      audioRef.current = audio;

      return new Promise<Result<unknown>>((resolve) => {
        resolverRef.current = resolve;
        audio.play((success: any) => {
          audio.release();
          if (token !== playTokenRef.current) {
            return;
          }

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
