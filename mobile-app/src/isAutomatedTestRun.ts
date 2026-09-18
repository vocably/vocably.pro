import { NativeModules, Platform } from 'react-native';

/**
 * Google Play runs the pre-launch report and the automated tests of the review process on Firebase
 * Test Lab devices. Without this flag every such run shows up as a real person in PostHog and as a
 * brand new anonymous subscriber in RevenueCat, which skews both sets of numbers.
 *
 * The detection itself lives in the `VocablyAutomatedTest` Android module.
 */
const detectAutomatedTestRun = (): boolean => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const nativeModule = NativeModules.VocablyAutomatedTest;

    if (!nativeModule) {
      return false;
    }

    // The new architecture exposes constants through getConstants(), the old one flattens them
    // onto the module itself.
    const constants = nativeModule.getConstants
      ? nativeModule.getConstants()
      : nativeModule;

    return constants?.isAutomatedTestRun === true;
  } catch (e) {
    console.warn(`Can't detect whether this is an automated test run`, e);
    return false;
  }
};

export const isAutomatedTestRun = detectAutomatedTestRun();

/**
 * All automated test runs share a single RevenueCat app user id instead of creating a new
 * anonymous subscriber each time.
 */
export const automatedTestAppUserId = 'google-play-automated-test';
