import { usePostHog } from 'posthog-react-native';
import React, { FC, useState } from 'react';
import { Linking, StyleProp, View, ViewStyle } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { mobileStoreName, mobileStoreUrl } from '../mobilePlatform';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const PaidAccount: FC<Props> = ({ style }) => {
  const theme = useTheme();
  const { t } = useTranslation();

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
          <Text style={{ fontSize: 16 }}>{t('paidAccount.youArePremium')}</Text>
          <Button
            onPress={() => {
              posthog.capture('premiumExplanationClicked');
              setExplanationVisible(true);
            }}
          >
            {t('paidAccount.why')}
          </Button>
        </View>
      </View>
      <Portal>
        <Dialog visible={explanationVisible}>
          <Dialog.Content style={{ gap: 12, paddingRight: 32 }}>
            <Text variant="headlineMedium">{t('paidAccount.iDontKnow')}</Text>
            <Text>{t('paidAccount.possibleReasons')}</Text>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text>{'•'}</Text>
                <Text>{t('paidAccount.reasonEarlyUser')}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text>{'•'}</Text>
                <Text>{t('paidAccount.reasonILikeYou')}</Text>
              </View>
            </View>
            <Text>{t('paidAccount.enjoyPremium')}</Text>
            <Text>
              <Trans
                i18nKey="paidAccount.wantToHelp"
                values={{ storeName: mobileStoreName }}
                components={{
                  rate: (
                    <Text
                      style={{ color: theme.colors.primary }}
                      onPress={() => {
                        posthog.capture('premiumExplanationRateClicked');
                        Linking.openURL(mobileStoreUrl).then();
                        setExplanationVisible(false);
                      }}
                    />
                  ),
                }}
              />
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExplanationVisible(false)}>
              {t('common.close')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
