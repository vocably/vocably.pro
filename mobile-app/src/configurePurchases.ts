import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export const configurePurchases = () => {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.WARN);

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: 'appl_FNZugGphmSHimfrAmGJlScQLYQO' });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: 'goog_qyWCrPaMtbeUbPMeTuhckfUuhzP' });
    }
  }, []);
};
