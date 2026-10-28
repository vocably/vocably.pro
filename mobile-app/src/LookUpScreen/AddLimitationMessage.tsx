import { CardItem, CardsLimit } from '@vocably/model';
import { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { mainPadding } from '../styles';
import { primaryShadow, useAppTheme } from '../ThemeProvider';
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
  const theme = useAppTheme();
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
            <Button
              testID="add-limitation-ok"
              onPress={() => setUpgradeDialogVisibility(false)}
            >
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
        <Button
          testID="add-limitation-upgrade"
          mode="contained"
          onPress={upgradeClick}
          style={{ boxShadow: primaryShadow(theme) }}
          icon={({ size, color }) => (
            <MaterialIcon name="workspace-premium" size={size} color={color} />
          )}
        >
          {t('cardsLimit.upgradeToPremium')}
        </Button>
      </View>
    </>
  );
};
