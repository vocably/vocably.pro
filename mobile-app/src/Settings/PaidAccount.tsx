import { usePostHog } from 'posthog-react-native';
import React, { FC, useState } from 'react';
import { Linking, StyleProp, View, ViewStyle } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { mobileStoreName, mobileStoreUrl } from '../mobilePlatform';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const PaidAccount: FC<Props> = ({ style }) => {
  const theme = useTheme();

  const posthog = usePostHog();
  const [explanationVisible, setExplanationVisible] = useState(false);

  return (
    <>
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <Icon
            name={'crown-outline'}
            size={24}
            color={theme.colors.onSurface}
          />
          <Text style={{ fontSize: 16 }}>You are a Premium user</Text>
          <Button
            onPress={() => {
              posthog.capture('premiumExplanationClicked');
              setExplanationVisible(true);
            }}
          >
            Why?
          </Button>
        </View>
      </View>
      <Portal>
        <Dialog visible={explanationVisible}>
          <Dialog.Content style={{ gap: 12, paddingRight: 32 }}>
            <Text variant="headlineMedium">I don't know.</Text>
            <Text>Possible reasons:</Text>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text>{'\u2022'}</Text>
                <Text>You are one of the first active users of Vocably</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text>{'\u2022'}</Text>
                <Text>I like you</Text>
              </View>
            </View>
            <Text>Anyway, enjoy your Premium.</Text>
            <Text>
              Want to help this app?{' '}
              <Text
                style={{ color: theme.colors.primary }}
                onPress={() => {
                  posthog.capture('premiumExplanationRateClicked');
                  Linking.openURL(mobileStoreUrl).then();
                  setExplanationVisible(false);
                }}
              >
                Rate it on {mobileStoreName}
              </Text>
              .
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExplanationVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
