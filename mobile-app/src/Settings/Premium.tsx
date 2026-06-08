import { FC, useState } from 'react';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text, useTheme } from 'react-native-paper';
import { CustomerInfo } from 'react-native-purchases';

type Props = {
  customerInfo: CustomerInfo;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

export const Premium: FC<Props> = ({
  customerInfo,
  isRefreshing = false,
  onRefresh = () => null,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const premium = customerInfo.entitlements.active['premium'];

  const [showRefresh, setShowRefresh] = useState(false);

  const expirationDate = premium.expirationDate
    ? new Date(premium.expirationDate ?? '').toLocaleDateString()
    : false;

  return (
    <View style={{ gap: 4, paddingRight: 12 }}>
      <Text style={{ fontSize: 16, color: theme.colors.secondary }}>
        {t('premium.label')}
      </Text>
      {premium.willRenew && expirationDate && (
        <Text>{t('premium.nextPayment', { date: expirationDate })}</Text>
      )}
      {!premium.willRenew && expirationDate && (
        <Text>{t('premium.validUntil', { date: expirationDate })}</Text>
      )}
      {premium.willRenew && customerInfo.managementURL && (
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() => {
            Linking.openURL(customerInfo.managementURL ?? '');
            setTimeout(() => setShowRefresh(true), 200);
          }}
        >
          {t('premium.manageSubscription')}
        </Text>
      )}

      {showRefresh && (
        <>
          <Text>{t('premium.refreshHint')}</Text>

          <Button
            icon={'refresh'}
            mode="outlined"
            loading={isRefreshing}
            onPress={() => onRefresh()}
            style={{
              alignSelf: 'flex-start',
              marginTop: 8,
            }}
          >
            {t('premium.refresh')}
          </Button>
        </>
      )}
    </View>
  );
};
