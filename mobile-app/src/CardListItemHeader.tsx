import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { Card, isGoogleTTSLanguage } from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelRatio, Platform, Pressable, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PlaySound } from './PlaySound';

type Props = {
  card: Card;
  allowCopy: boolean;
  aiButton: 'dimmed' | 'bright' | 'none';
  onCopy: () => void;
};

const textTransform = [{ translateY: 6 }];
const lineHeight = Platform.OS === 'ios' ? 26 : 20;

export const CardListItemHeader: FC<Props> = ({
  card,
  allowCopy,
  aiButton,
  onCopy,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  const fontScale = PixelRatio.getFontScale();

  const present = card.presentTenses
    ? t('common.presentTenses', { value: card.presentTenses })
    : false;
  const past =
    card.tense === 'present' && card.pastTenses
      ? t('common.pastTenses', { value: card.pastTenses })
      : false;

  const presentAndPast = [present, past].filter(Boolean).join(`\n`);

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      <View style={{ width: '100%' }}>
        <Text
          style={{
            fontSize: 16,
            textAlignVertical: 'top',
          }}
        >
          {isGoogleTTSLanguage(card.language) && (
            <>
              <PlaySound
                text={card.source}
                language={card.language}
                size={22}
                style={{
                  transform: [
                    { translateY: Platform.OS === 'android' ? 6 : 2 },
                  ],
                  justifyContent: 'center',
                }}
              />{' '}
            </>
          )}
          <Text
            style={{
              fontSize: 24,
              color: theme.colors.secondary,
            }}
          >
            {card.source}
          </Text>
          {allowCopy && (
            <>
              {'\u00A0'}
              <Pressable
                hitSlop={10}
                onPress={() => {
                  Clipboard.setString(card.source);
                  onCopy();
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.4 : 1,
                  transform: [
                    { translateY: Platform.OS === 'android' ? 6 : 0 },
                  ],
                })}
              >
                <Icon
                  name="content-copy"
                  size={17 * fontScale}
                  color={theme.colors.onSurface}
                />
              </Pressable>
            </>
          )}
          {aiButton !== 'none' && (
            <>
              {'\u00A0'}
              {'\u00A0'}
              {'\u00A0'}
              <Pressable
                hitSlop={10}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('ChatWithCardModal', {
                    card,
                  });
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.4 : 1,
                  transform: [
                    { translateY: Platform.OS === 'android' ? 6 : 0 },
                  ],
                })}
              >
                <Icon
                  name="creation"
                  size={17 * fontScale}
                  color={
                    aiButton === 'bright'
                      ? theme.colors.primary
                      : theme.colors.onSurface
                  }
                />
              </Pressable>
              {'\u00A0'}
              {'\u00A0'}
              {'\u00A0'}
            </>
          )}
          {card.ipa && (
            <>
              {' '}
              <View style={{ transform: textTransform }}>
                <Text style={{ lineHeight }}>
                  /{sanitizeTranscript(card.ipa)}/
                </Text>
              </View>
            </>
          )}

          {card.g && (
            <>
              {' '}
              <View style={{ transform: textTransform }}>
                <Text style={{ lineHeight }}>({card.g})</Text>
              </View>
            </>
          )}

          {card.partOfSpeech && (
            <>
              {' '}
              <View style={{ transform: textTransform }}>
                <Text style={{ lineHeight }}>
                  {t(`language.${card.partOfSpeech}`, card.partOfSpeech)}
                </Text>
              </View>
            </>
          )}

          {presentAndPast && (
            <>
              {'\n'}
              <View style={{ transform: textTransform }}>
                <Text style={{ lineHeight }}>{presentAndPast}</Text>
              </View>
            </>
          )}

          {card.number === 'singular' && isGoodPlural(card.pluralForm) && (
            <>
              {' '}
              <View style={{ transform: textTransform }}>
                <Text style={{ lineHeight }}>
                  {t('common.plural', { value: card.pluralForm })}
                </Text>
              </View>
            </>
          )}
        </Text>
      </View>
    </View>
  );
};
