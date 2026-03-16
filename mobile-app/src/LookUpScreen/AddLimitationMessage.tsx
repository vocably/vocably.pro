import { CardItem, CardsLimit } from '@vocably/model';
import { FC, useState } from 'react';
import { Linking, View } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import { mainPadding } from '../styles';
import { usePresentPaywall } from '../usePresentPaywall';
import { plural } from '../plural';

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
              Open Vocably {'->'} Settings to upgrade.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUpgradeDialogVisibility(false)}>
              Okay
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
          Your collection has
          {cards.length > maxCards.maxCards ? ' more  than' : ''}{' '}
          <Text style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
            {maxCards.maxCards}
          </Text>{' '}
          cards. Now you can save{' '}
          <Text style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
            {plural(maxCards.cardsPerDay, 'card', true)} per day.
          </Text>{' '}
          Premium users don't have this limit.
        </Text>
        <Button mode="contained" onPress={upgradeClick}>
          Upgrade to Premium
        </Button>
      </View>
    </>
  );
};
