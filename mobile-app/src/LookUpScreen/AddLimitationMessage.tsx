import { CardItem, CardsLimit } from '@vocably/model';
import { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import { mainPadding } from '../styles';
import { usePresentPaywall } from '../usePresentPaywall';

type Props = {
  leftInset: number;
  rightInset: number;
  cards: CardItem[];
  maxCards: CardsLimit;
  isSharedLookup: boolean;
};

export const AddLimitationMessage: FC<Props> = ({
  cards,
  maxCards,
  leftInset,
  rightInset,
  isSharedLookup,
}) => {
  const [upgradeDialogVisible, setUpgradeDialogVisibility] = useState(false);

  const presentPaywall = usePresentPaywall();
  const theme = useTheme();
  const { t } = useTranslation();

  if (maxCards === 'unlimited') {
    return <></>;
  }

  const upgradeClick = async () => {
    if (!isSharedLookup) {
      await presentPaywall();
      return;
    }

    if (await Linking.canOpenURL('vocably-pro://upgrade')) {
      await Linking.openURL('vocably-pro://upgrade');
      return;
    }

    setUpgradeDialogVisibility(true);
  };

  return (
    <>
      <Portal>
        <Dialog visible={upgradeDialogVisible}>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {t('cardsLimit.openVocablySettings')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUpgradeDialogVisibility(false)}>
              {t('common.ok')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View
        style={{
          paddingLeft: leftInset + mainPadding,
          // Align ⊕ button with the 🔎
          paddingRight: rightInset + 16,
          paddingTop: 24,
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <Text>
          <Trans
            i18nKey={
              cards.length > maxCards.maxCards
                ? 'cardsLimit.collectionHasMoreThan'
                : 'cardsLimit.collectionHas'
            }
            values={{
              maxCards: maxCards.maxCards,
              count: maxCards.cardsPerDay,
            }}
            components={{
              bold: (
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: theme.colors.secondary,
                  }}
                />
              ),
            }}
          />
        </Text>
        <Button mode="contained" onPress={upgradeClick}>
          {t('cardsLimit.upgradeToPremium')}
        </Button>
      </View>
    </>
  );
};
