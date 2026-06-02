import { GoogleTTSLanguage, Result } from '@vocably/model';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  ColorValue,
  PixelRatio,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePlaySound } from './PlaySoundContainer';
import { iconButtonOpacity, pressedIconButtonOpacity } from './stupidConstants';

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
    const { play: contextPlay, stop: contextStop } = usePlaySound();
    const [isError, setIsError] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);

    const play = async (): Promise<Result<unknown>> => {
      setIsError(false);
      setIsPlaying(true);
      const result = await contextPlay(text, language);
      setIsPlaying(false);
      if (!result.success) {
        setIsError(true);
      }
      return result;
    };

    const stop = () => {
      if (isPlaying) {
        contextStop();
        setIsPlaying(false);
      }
    };

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
