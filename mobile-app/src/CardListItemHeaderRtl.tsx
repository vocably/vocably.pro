import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { Card, isGoogleTTSLanguage } from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelRatio, Platform, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PlaySound } from './PlaySound';
import { isolate } from './isolate';

const LRM = '\u200E';

type Props = {
  card: Card;
  allowCopy: boolean;
  aiButton: 'dimmed' | 'bright' | 'none';
  onCopy: () => void;
};

// The header is a single LTR paragraph (LRM forces the direction). RTL pieces
// are wrapped with isolate() so they keep their own direction without
// reordering the rest of the line.
// Everything except the play button is nested Text: RN mispositions inline
// views that follow wrapped RTL text.
export const CardListItemHeaderRtl: FC<Props> = ({
  card,
  allowCopy,
  aiButton,
  onCopy,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const [pressedIcon, setPressedIcon] = useState<'copy' | 'ai' | null>(null);

  const fontScale = PixelRatio.getFontScale();

  const present = card.presentTenses
    ? t('common.presentTenses', { value: isolate(card.presentTenses) })
    : false;
  const past =
    card.tense === 'present' && card.pastTenses
      ? t('common.pastTenses', { value: isolate(card.pastTenses) })
      : false;

  const presentAndPast = [present, past].filter(Boolean).join(`\n`);

  return (
    <View style={{ width: '100%' }}>
      <Text style={{ fontSize: 16, textAlign: 'left' }}>
        {LRM}
        {isGoogleTTSLanguage(card.language) && (
          <>
            <PlaySound
              text={card.source}
              language={card.language}
              size={22}
              style={{
                transform: [{ translateY: Platform.OS === 'android' ? 6 : 2 }],
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
          {isolate(card.source)}
        </Text>
        {allowCopy && (
          <>
            {'  '}
            <Icon
              name="content-copy"
              size={17 * fontScale}
              color={theme.colors.onSurface}
              suppressHighlighting
              onPressIn={() => setPressedIcon('copy')}
              onPressOut={() => setPressedIcon(null)}
              onPress={() => {
                Clipboard.setString(card.source);
                onCopy();
              }}
              style={{ opacity: pressedIcon === 'copy' ? 0.4 : 1 }}
            />
          </>
        )}
        {aiButton !== 'none' && (
          <>
            {'   '}
            <Icon
              name="creation"
              size={17 * fontScale}
              color={
                aiButton === 'bright'
                  ? theme.colors.primary
                  : theme.colors.onSurface
              }
              suppressHighlighting
              onPressIn={() => setPressedIcon('ai')}
              onPressOut={() => setPressedIcon(null)}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('ChatWithCardModal', {
                  card,
                });
              }}
              style={{ opacity: pressedIcon === 'ai' ? 0.4 : 1 }}
            />
            {' '}
          </>
        )}
        {card.ipa && <> /{isolate(sanitizeTranscript(card.ipa))}/</>}
        {card.g && <> ({isolate(card.g)})</>}
        {card.partOfSpeech && (
          <> {t(`language.${card.partOfSpeech}`, card.partOfSpeech)}</>
        )}
        {presentAndPast && <>{`\n${presentAndPast}`}</>}
        {card.number === 'singular' && isGoodPlural(card.pluralForm) && (
          <> {t('common.plural', { value: isolate(card.pluralForm) })}</>
        )}
      </Text>
    </View>
  );
};
