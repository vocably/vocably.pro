import { Card } from '@vocably/model';
import { explode, isGoodPlural } from '@vocably/sulna';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
import { Pressable, StyleProp, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';
import { maskTheWord } from './maskTheWord';
import { i18n } from './i18n';

type Props = {
  card: Card;
  textStyle?: StyleProp<Text>;
  maskSource?: boolean;
  showInflections?: boolean;
  onPress?: () => unknown;
  onLookUpModalOpen?: () => void;
  lookUpDisabled?: boolean;
  hideDefinitions?: boolean;
  enrichWithPartOfSpeech?: boolean;
  partOfSpeechFontSize?: number;
};

type Definition = {
  text: string;
  style: StyleProp<Text>;
  lookUpEnabled: boolean;
  partOfSpeech: string;
  bulStyle?: StyleProp<Text>;
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
  enrichWithPartOfSpeech = false,
  partOfSpeechFontSize,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();

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

  const partOfSpeech =
    enrichWithPartOfSpeech && card.partOfSpeech
      ? i18n.t(`language.${card.partOfSpeech}`, card.partOfSpeech)
      : '';

  if (partOfSpeech) {
    definitions.unshift({
      text: partOfSpeech + ':',
      style: { fontSize: partOfSpeechFontSize },
      lookUpEnabled: false,
      bulStyle: { opacity: 0 },
    });
  }

  return (
    <View
      style={{
        maxWidth: '100%',
      }}
    >
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
            <Text style={[textStyle, item.bulStyle]}>{bul}</Text>

            <Pressable
              style={({ pressed }) => [
                { opacity: pressed && lookUpEnabled && item ? 0.6 : 1.0 },
                {
                  flexShrink: 1,
                  alignSelf: 'flex-end',
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
              <Text style={[textStyle, item.style]}>{item.text}</Text>
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
          {t('cardDefinition.present')}{' '}
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
          {t('cardDefinition.past')}{' '}
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
            {t('cardDefinition.plural')}{' '}
            <Text style={{ color: theme.colors.secondary }}>
              {card.pluralForm}
            </Text>
          </Text>
        )}
    </View>
  );
};
