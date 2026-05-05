import { explode } from '@vocably/sulna';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Alert,
  PixelRatio,
  Platform,
  Pressable,
  StyleProp,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { maskTheWord } from './maskTheWord';
import { PlaySound, PlaySoundRef } from './PlaySound';
import { isGoogleTTSLanguage } from '@vocably/model';
import { get, shuffle } from 'lodash-es';
import { useNavigation } from '@react-navigation/native';

export type Mask = {
  text: string;
  language: string;
};

export type CardExampleRef = {
  play: () => Promise<void>;
};

type Props = {
  example: string;
  language: string;
  textStyle?: StyleProp<Text>;
  mask?: Mask;
  onPress?: () => unknown;
};

export const CardExample = forwardRef<CardExampleRef, Props>(
  ({ example, textStyle, mask, language, onPress }, ref) => {
    let examples = explode(example);

    const navigation = useNavigation();

    if (mask) {
      examples = examples
        .map(maskTheWord(mask.text, mask.language))
        .filter((replacementResult) => replacementResult.masked)
        .map((replacementResult) => replacementResult.value);
    }

    const bul = examples.length === 1 ? '' : '\u2022 ';

    const playDisabled = mask !== undefined;

    const playSoundRefs = useRef<(PlaySoundRef | null)[]>([]);

    const lookUpEnabled = mask === undefined;

    useImperativeHandle(ref, () => ({
      play: async () => {
        if (!isGoogleTTSLanguage(language) || playDisabled) {
          return;
        }

        const validRefs = playSoundRefs.current.filter(
          (r): r is PlaySoundRef => r !== null
        );

        if (validRefs.length === 0) {
          return;
        }

        await shuffle(validRefs)[0].play();
      },
    }));

    return (
      <>
        {examples.map((text, index) => (
          <View
            key={index}
            style={{
              marginTop: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {isGoogleTTSLanguage(language) ? (
              <PlaySound
                ref={(el) => {
                  playSoundRefs.current[index] = el;
                }}
                text={text}
                language={language}
                size={20}
                hitSlop={4}
                disabled={playDisabled}
                style={{
                  alignSelf: 'flex-start',
                  opacity: playDisabled ? 0.8 : 0.2,
                }}
              />
            ) : (
              <Text>{bul}</Text>
            )}

            <Pressable
              style={({ pressed }) => [
                { opacity: pressed && lookUpEnabled ? 0.6 : 1.0 },
                {
                  flexShrink: 1,
                },
              ]}
              onPress={onPress}
              onLongPress={
                lookUpEnabled
                  ? () => {
                      // @ts-ignore
                      navigation.push('LookUpModal', {
                        text,
                      });
                    }
                  : undefined
              }
            >
              <Text style={textStyle}>{text}</Text>
            </Pressable>
          </View>
        ))}
      </>
    );
  }
);
