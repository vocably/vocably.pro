import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import {
  automatedTestAppUserId,
  isAutomatedTestRun,
} from './isAutomatedTestRun';

export const configurePurchases = () => {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.WARN);

    // Google Play's automated tests would otherwise register a brand new anonymous subscriber on
    // every single run. Pinning them all to one app user id keeps the RevenueCat numbers clean.
    const appUserID = isAutomatedTestRun ? automatedTestAppUserId : undefined;

    if (Platform.OS === 'ios') {
      Purchases.configure({
        apiKey: 'appl_FNZugGphmSHimfrAmGJlScQLYQO',
        appUserID,
      });
    } else if (Platform.OS === 'android') {
      Purchases.configure({
        apiKey: 'goog_qyWCrPaMtbeUbPMeTuhckfUuhzP',
        appUserID,
      });
    }
  }, []);
};
