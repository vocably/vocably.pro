import { Card, TagItem } from '@vocably/model';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, View, ViewStyle } from 'react-native';
import {
  ActivityIndicator,
  Chip,
  Divider,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { CardDefinition } from './CardDefinition';
import { CardExample } from './CardExample';
import { CardListItemHeader } from './CardListItemHeader';
import { CardListItemHeaderRtl } from './CardListItemHeaderRtl';
import { isRtlLanguage } from './isRtlLanguage';

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

  const onTagClose = (tagToRemove: TagItem) => () => {
    onTagsChange(card.tags.filter((t) => t.id !== tagToRemove.id));
  };

  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    !copied && setCopied(true);
  };

  return (
    <View style={style}>
      {isRtlLanguage(card.language) ? (
        <CardListItemHeaderRtl
          card={card}
          allowCopy={allowCopy}
          aiButton={aiButton}
          onCopy={onCopy}
        />
      ) : (
        <CardListItemHeader
          card={card}
          allowCopy={allowCopy}
          aiButton={aiButton}
          onCopy={onCopy}
        />
      )}
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
