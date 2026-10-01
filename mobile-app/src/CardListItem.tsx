import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { Card, isGoogleTTSLanguage, TagItem } from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelRatio, Platform, StyleProp, View, ViewStyle } from 'react-native';
import {
  ActivityIndicator,
  Chip,
  Divider,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CardDefinition } from './CardDefinition';
import { CardExample } from './CardExample';
import { PlaySound } from './PlaySound';
import { isolate } from './isolate';

type Props = {
  card: Card;
  style?: StyleProp<ViewStyle>;
  showExamples?: boolean;
  savingTagsInProgress?: boolean;
  onTagsChange?: (tags: TagItem[]) => Promise<any>;
  onLookUpModalOpen?: () => void;
  allowCopy?: boolean;
  aiButton?: 'dimmed' | 'bright' | 'none';
  disabledModalLookup?: boolean;
  hideDefinitions?: boolean;
};

export const CardListItem: FC<Props> = ({
  card,
  style,
  showExamples = false,
  savingTagsInProgress = false,
  onTagsChange = () => null,
  onLookUpModalOpen,
  allowCopy = false,
  aiButton = 'dimmed',
  disabledModalLookup = false,
  hideDefinitions = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  const onTagClose = (tagToRemove: TagItem) => () => {
    onTagsChange(card.tags.filter((t) => t.id !== tagToRemove.id));
  };

  const [copied, setCopied] = useState(false);
  // Icons are nested Text (not Pressable) so they flow inline with the source
  // text: RN mispositions inline views after wrapped RTL text on iOS.
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
    <View style={style}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          width: '100%',
          direction: 'ltr',
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
              {isolate(card.source)}
            </Text>
            {allowCopy && (
              <>
                {isolate('\u00A0')}
                <Icon
                  name="content-copy"
                  size={17 * fontScale}
                  color={theme.colors.onSurface}
                  suppressHighlighting
                  onPressIn={() => setPressedIcon('copy')}
                  onPressOut={() => setPressedIcon(null)}
                  onPress={() => {
                    Clipboard.setString(card.source);
                    !copied && setCopied(true);
                  }}
                  style={{ opacity: pressedIcon === 'copy' ? 0.4 : 1 }}
                />
              </>
            )}
            {aiButton !== 'none' && (
              <>
                {isolate('\u00A0\u00A0\u00A0')}
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
                {isolate('\u00A0\u00A0\u00A0')}
              </>
            )}
            {card.ipa && (
              <>
                {' '}
                <Text>/{isolate(sanitizeTranscript(card.ipa))}/</Text>
              </>
            )}

            {card.g && (
              <>
                {' '}
                <Text>({isolate(card.g)})</Text>
              </>
            )}

            {card.partOfSpeech && (
              <>
                {' '}
                <Text>
                  {t(`language.${card.partOfSpeech}`, card.partOfSpeech)}
                </Text>
              </>
            )}

            {presentAndPast && (
              <>
                {'\n'}
                <Text>{isolate(presentAndPast)}</Text>
              </>
            )}

            {card.number === 'singular' && isGoodPlural(card.pluralForm) && (
              <>
                {' '}
                <Text>
                  {t('common.plural', { value: isolate(card.pluralForm) })}
                </Text>
              </>
            )}
          </Text>
        </View>
      </View>
      {allowCopy && (
        <Portal>
          <Snackbar
            visible={copied}
            onDismiss={() => copied && setCopied(false)}
            duration={2000}
          >
            {t('exportDeck.copiedToClipboard')}
          </Snackbar>
        </Portal>
      )}
      <View style={{ marginTop: 8 }}>
        <CardDefinition
          card={card}
          onLookUpModalOpen={onLookUpModalOpen}
          lookUpDisabled={disabledModalLookup}
          hideDefinitions={hideDefinitions}
        />
      </View>
      {showExamples && card.example && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>{t('common.examples')}</Text>
          <CardExample
            onLookUpModalOpen={onLookUpModalOpen}
            example={card.example}
            language={card.language}
            lookUpDisabled={disabledModalLookup}
          />
        </View>
      )}
      {(card.tags.length > 0 || savingTagsInProgress) && (
        <View
          style={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            minHeight: 36,
          }}
        >
          {card.tags.map((tag) => (
            <Chip
              key={tag.id}
              selectedColor={theme.colors.onSurface}
              mode="outlined"
              onClose={onTagClose(tag)}
            >
              {tag.data.title}
            </Chip>
          ))}
          {savingTagsInProgress && (
            <ActivityIndicator color={theme.colors.onBackground} />
          )}
        </View>
      )}
    </View>
  );
};

export const Separator: FC = () => <Divider style={{ zIndex: 1 }} />;
