import { explode } from '@vocably/sulna';
import React, { FC } from 'react';
import { PixelRatio, StyleProp } from 'react-native';
import { Text } from 'react-native-paper';
import { maskTheWord } from './maskTheWord';
import { PlaySound } from './PlaySound';
import { isGoogleTTSLanguage } from '@vocably/model';
import { get } from 'lodash-es';

export type Mask = {
  text: string;
  language: string;
};

type Props = {
  example: string;
  language: string;
  textStyle?: StyleProp<Text>;
  mask?: Mask;
};

export const CardExample: FC<Props> = ({
  example,
  textStyle,
  mask,
  language,
}) => {
  let examples = explode(example);

  if (mask) {
    examples = examples
      .map(maskTheWord(mask.text, mask.language))
      .filter((replacementResult) => replacementResult.masked)
      .map((replacementResult) => replacementResult.value);
  }

  const bul = examples.length === 1 ? '' : '\u2022 ';

  const fontScale = PixelRatio.getFontScale();

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
          {isGoogleTTSLanguage(language) && mask === undefined ? (
            <PlaySound
              text={text}
              language={language}
              size={20}
              style={{
                transform: [
                  {
                    translateY:
                      (28 - get(textStyle, 'fontSize', 14)) * fontScale * 0.35,
                  },
                  { translateX: -2 },
                ],
                opacity: 0.2,
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
};
