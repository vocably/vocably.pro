import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { AuthContext } from './auth/AuthContainer';

type Props = {};

export type CustomerInfoStatus =
  | {
      status: 'undefined';
    }
  | {
      status: 'loaded';
      customerInformation: CustomerInfo;
    };

type CustomerInfoContext = CustomerInfoStatus & {
  refresh: () => Promise<unknown>;
  restore: () => Promise<unknown>;
};

export const CustomerInfoContext = createContext<CustomerInfoContext>({
  status: 'undefined',
  refresh: async () => null,
  restore: async () => null,
});

export const CustomerInfoContainer: FC<PropsWithChildren<Props>> = ({
  children,
}) => {
  const authStatus = useContext(AuthContext);

  const [customerInfoStatus, setCustomerInfoStatus] =
    useState<CustomerInfoStatus>({
      status: 'undefined',
    });

  useEffect(() => {
    if (
      authStatus['status'] !== 'logged-in' &&
      authStatus['status'] !== 'anonymous-logged-in'
    ) {
      return;
    }

    const customerId =
      authStatus['status'] === 'logged-in' ? authStatus.sub : authStatus.id;

    const customerInfoRefreshed = (customerInfo: CustomerInfo) => {
      setCustomerInfoStatus({
        status: 'loaded',
        customerInformation: customerInfo,
      });
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoRefreshed);
    Purchases.logIn(customerId).then(({ customerInfo }) => {
      setCustomerInfoStatus({
        status: 'loaded',
        customerInformation: customerInfo,
      });
    });

    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoRefreshed);
    };
  }, [authStatus]);

  const refresh = async () => {
    try {
      await Purchases.invalidateCustomerInfoCache();
      const customerInformation = await Purchases.getCustomerInfo();
      setCustomerInfoStatus({
        status: 'loaded',
        customerInformation,
      });
    } catch (e) {
      console.error(`Can't refresh customer info`, e);
    }
  };

  const restore = async () => {
    try {
      const customerInformation = await Purchases.restorePurchases();
      setCustomerInfoStatus({
        status: 'loaded',
        customerInformation,
      });
    } catch (e) {
      console.error(`Can't restore customer purchases`, e);
    }
  };

  return (
    <CustomerInfoContext.Provider
      value={{
        ...customerInfoStatus,
        refresh,
        restore,
      }}
    >
      {children}
    </CustomerInfoContext.Provider>
  );
};
