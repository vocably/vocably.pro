import { FC, useContext } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CustomerInfo } from 'react-native-purchases';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../auth/AuthContainer';
import { CustomerInfoContext } from '../CustomerInfoContainer';
import { InlineLoader } from '../loaders/InlineLoader';
import { CustomSurface } from '../ui/CustomSurface';
import { ListItem } from '../ui/ListItem';
import { usePresentPaywall } from '../usePresentPaywall';
import { PaidAccount } from './PaidAccount';
import { Premium } from './Premium';

type Props = {
  style?: StyleProp<ViewStyle>;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

const isPremium = (customerInfo: CustomerInfo): boolean => {
  return customerInfo.entitlements.active['premium'] !== undefined;
};

export const Subscription: FC<Props> = ({
  style,
  isRefreshing = false,
  onRefresh = () => null,
}) => {
  const theme = useTheme();
  const presentPaywall = usePresentPaywall();

  const customerInfoStatus = useContext(CustomerInfoContext);
  const authStatus = useContext(AuthContext);

  const isLifetimePremium =
    customerInfoStatus.status === 'loaded' &&
    !isPremium(customerInfoStatus.customerInformation) &&
    authStatus.status === 'logged-in' &&
    authStatus.isPaidGroup;

  if (isLifetimePremium) {
    return <PaidAccount style={style} />;
  }

  return (
    <CustomSurface style={style}>
      {customerInfoStatus.status === 'undefined' && (
        <View style={{ padding: 16 }}>
          <InlineLoader center={false}>Loading customer status</InlineLoader>
        </View>
      )}
      {customerInfoStatus.status === 'loaded' && (
        <>
          {isPremium(customerInfoStatus.customerInformation) && (
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
                <Premium
                  customerInfo={customerInfoStatus.customerInformation}
                  isRefreshing={isRefreshing}
                  onRefresh={onRefresh}
                />
              </View>
            </View>
          )}
          {!isPremium(customerInfoStatus.customerInformation) && (
            <ListItem
              leftIcon="crown-outline"
              rightIcon=""
              title="Go Premium"
              onPress={() => presentPaywall('mobile-premium')}
            />
          )}
        </>
      )}
    </CustomSurface>
  );
};
