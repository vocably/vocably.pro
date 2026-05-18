import { Card } from '@vocably/model';
import { explode, isGoodPlural } from '@vocably/sulna';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
import { PixelRatio, Platform, Pressable, StyleProp, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { maskTheWord } from './maskTheWord';
import { get } from 'lodash-es';

type Props = {
  card: Card;
  textStyle?: StyleProp<Text>;
  maskSource?: boolean;
  showInflections?: boolean;
  onPress?: () => unknown;
  onLookUpModalOpen?: () => void;
  lookUpDisabled?: boolean;
  hideDefinitions?: boolean;
};

type Definition = {
  text: string;
  style: StyleProp<Text>;
  lookUpEnabled: boolean;
};

export const CardDefinition: FC<Props> = ({
  card,
  textStyle,
  maskSource = false,
  showInflections = false,
  onPress,
  onLookUpModalOpen,
  lookUpDisabled = false,
  hideDefinitions = false,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  let definitions: Definition[] = [];

  if (!hideDefinitions) {
    definitions = explode(card.definition).map((text) => ({
      text,
      style: {},
      lookUpEnabled: true,
    }));

    if (maskSource) {
      definitions = definitions
        .filter(
          (definition) =>
            !(definition.text.includes('[') && definition.text.includes(']'))
        )
        .map((definition) => {
          return {
            ...definition,
            text: maskTheWord(card.source, card.language)(definition.text)
              .value,
          };
        });
    }
  }

  if (card.translation) {
    definitions.unshift({
      text: card.translation,
      style: {
        color: theme.colors.secondary,
      },
      lookUpEnabled: false,
    });
  }

  const bul = '\u2022 ';

  return (
    <>
      {definitions.map((item, index) => {
        const lookUpEnabled = !lookUpDisabled && item.lookUpEnabled;
        return (
          <View
            key={index}
            style={{
              marginTop: 4,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 4,
            }}
          >
            <Text style={textStyle}>{bul}</Text>

            <Pressable
              style={({ pressed }) => [
                { opacity: pressed && lookUpEnabled && item ? 0.6 : 1.0 },
                {
                  flexBasis: '100%',
                },
              ]}
              onPress={onPress}
              onLongPress={
                lookUpEnabled
                  ? () => {
                      // @ts-ignore
                      navigation.push('LookUpModal', {
                        text: item.text,
                      });
                      onLookUpModalOpen && onLookUpModalOpen();
                    }
                  : undefined
              }
            >
              <Text style={[item.style, textStyle]}>{item.text}</Text>
            </Pressable>
          </View>
        );
      })}
      {showInflections && card.presentTenses && (
        <Text
          style={[
            textStyle,
            {
              marginTop: 16,
            },
          ]}
        >
          Present:{' '}
          <Text style={{ color: theme.colors.secondary }}>
            {card.presentTenses}
          </Text>
        </Text>
      )}
      {showInflections && card.tense === 'present' && card.pastTenses && (
        <Text
          style={[
            textStyle,
            {
              marginTop: 16,
            },
          ]}
        >
          Past:{' '}
          <Text style={{ color: theme.colors.secondary }}>
            {card.pastTenses}
          </Text>
        </Text>
      )}

      {showInflections &&
        card.number === 'singular' &&
        isGoodPlural(card.pluralForm) && (
          <Text
            style={[
              textStyle,
              {
                marginTop: 16,
              },
            ]}
          >
            Plural:{' '}
            <Text style={{ color: theme.colors.secondary }}>
              {card.pluralForm}
            </Text>
          </Text>
        )}
    </>
  );
};
