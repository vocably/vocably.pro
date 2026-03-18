import { explode } from '@vocably/sulna';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { PixelRatio, Platform, StyleProp } from 'react-native';
import { Text } from 'react-native-paper';
import { maskTheWord } from './maskTheWord';
import { PlaySound, PlaySoundRef } from './PlaySound';
import { isGoogleTTSLanguage } from '@vocably/model';
import { get, shuffle } from 'lodash-es';

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
};

export const CardExample = forwardRef<CardExampleRef, Props>(
  ({ example, textStyle, mask, language }, ref) => {
    let examples = explode(example);

    if (mask) {
      examples = examples
        .map(maskTheWord(mask.text, mask.language))
        .filter((replacementResult) => replacementResult.masked)
        .map((replacementResult) => replacementResult.value);
    }

    const bul = examples.length === 1 ? '' : '\u2022 ';

    const fontScale = PixelRatio.getFontScale();

    const playDisabled = mask !== undefined;

    const playSoundRefs = useRef<(PlaySoundRef | null)[]>([]);

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
          <Text
            key={index}
            style={[
              textStyle,
              {
                marginTop: 6,
              },
            ]}
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
                  transform: [
                    {
                      translateY:
                        (28 - get(textStyle, 'fontSize', 14)) *
                        fontScale *
                        (Platform.OS === 'ios' ? 0.35 : 0.4),
                    },
                    { translateX: -2 },
                  ],
                  opacity: playDisabled ? 0.8 : 0.2,
                }}
              />
            ) : (
              bul
            )}

            {text}
          </Text>
        ))}
      </>
    );
  }
);
