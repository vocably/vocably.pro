import { GoogleTTSLanguage, Result } from '@vocably/model';
import { languageToGoogleTranslateLanguage } from '@vocably/model-operations';
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ColorValue,
  PixelRatio,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Sentry } from './BetterSentry';
import { iconButtonOpacity, pressedIconButtonOpacity } from './stupidConstants';

let activeInstance: { stop: () => void } | null = null;

export type PlaySoundRef = {
  play: () => Promise<Result<unknown>>;
  stop: () => void;
};

type Props = {
  text: string;
  language: GoogleTTSLanguage;
  disabled?: boolean;
  size?: number;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  color?: ColorValue;
};

export const PlaySound = forwardRef<PlaySoundRef, Props>(
  (
    {
      text,
      language,
      size = 16,
      style = {},
      color,
      hitSlop = 20,
      disabled = false,
    },
    ref
  ) => {
    const theme = useTheme();

    const [isPlaying, setIsPlaying] = useState(false);
    const [isError, setIsError] = useState(false);
    const loadedAudioRef = useRef<Sound>();
    const loadedAudioResolverRef = useRef<(value: Result<unknown>) => void>();
    const stopRef = useRef<{ stop: () => void }>({ stop: () => {} });

    const loadAudio = (): Promise<Result<Sound>> => {
      if (loadedAudioRef.current) {
        return Promise.resolve({
          success: true,
          value: loadedAudioRef.current,
        });
      }

      return new Promise((resolve) => {
        const soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          text
        )}&tl=${languageToGoogleTranslateLanguage(language)}&client=tw-ob`;
        Sound.setCategory('Playback');
        const audio = new Sound(soundUrl, '', (error) => {
          if (error === null) {
            loadedAudioRef.current = audio;

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

    const play = async (): Promise<Result<unknown>> => {
      if (activeInstance && activeInstance !== stopRef.current) {
        activeInstance.stop();
      }
      activeInstance = stopRef.current;
      setIsPlaying(true);
      setIsError(false);

      const loadedAudioResult = await loadAudio();

      if (!loadedAudioResult.success) {
        setIsPlaying(false);
        setIsError(true);
        return loadedAudioResult;
      }

      return new Promise((resolve) => {
        loadedAudioResolverRef.current = resolve;
        loadedAudioResult.value.play((success) => {
          setIsPlaying(false);

          if (success) {
            resolve({
              success: true,
              value: null,
            });
          } else {
            resolve({
              success: false,
              reason: 'Play sound ended up with error.',
            });
          }
        });
      });
    };

    const stop = () => {
      if (loadedAudioRef.current) {
        if (Platform.OS === 'android') {
          loadedAudioRef.current.pause(() => {
            loadedAudioRef.current?.release();
            loadedAudioRef.current = undefined;
          });
        } else {
          loadedAudioRef.current.stop();
        }
      }

      if (loadedAudioResolverRef.current) {
        loadedAudioResolverRef.current({
          success: true,
          value: null,
        });

        loadedAudioResolverRef.current = undefined;
      }

      setIsPlaying(false);

      if (activeInstance === stopRef.current) {
        activeInstance = null;
      }
    };

    stopRef.current = { stop };

    useImperativeHandle(ref, () => ({
      play,
      stop,
    }));

    const fontScale = PixelRatio.getFontScale();

    return (
      <Pressable
        hitSlop={hitSlop}
        disabled={disabled}
        style={({ pressed }) => [
          {
            opacity: pressed ? pressedIconButtonOpacity : iconButtonOpacity,
            // Make play sound stand out and hitSlop working
            zIndex: 1,
          },
          style,
        ]}
        onPress={() => {
          isPlaying ? stop() : play();
        }}
      >
        <Icon
          name={
            isPlaying
              ? 'volume-medium'
              : disabled
                ? 'circle-small'
                : isError
                  ? 'alert-circle-outline'
                  : 'play-circle'
          }
          style={{
            color: isError
              ? theme.colors.error
              : (color ?? theme.colors.onBackground),
          }}
          size={size * fontScale}
        />
      </Pressable>
    );
  }
);
