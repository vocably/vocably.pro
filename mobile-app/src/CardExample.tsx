import { explode } from '@vocably/sulna';
import React, { FC } from 'react';
import { StyleProp } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { maskTheWord } from './maskTheWord';
import { PlaySound } from './PlaySound';
import { isGoogleTTSLanguage } from '@vocably/model';

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
  const theme = useTheme();
  let examples = explode(example);

  if (mask) {
    examples = examples
      .map(maskTheWord(mask.text, mask.language))
      .filter((replacementResult) => replacementResult.masked)
      .map((replacementResult) => replacementResult.value);
  }

  const bul = examples.length === 1 ? '' : '\u2022 ';

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
                transform: [{ translateY: 4 }, { translateX: -2 }],
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
