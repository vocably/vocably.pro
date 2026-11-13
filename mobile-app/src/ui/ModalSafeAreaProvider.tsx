import React, { FC, ReactNode } from 'react';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

/**
 * A safe area provider for a modal that draws under the system bars.
 *
 * The app isn't edge-to-edge on Android, so the insets of the app's provider
 * are zero there, while a translucent modal draws under the navigation bar.
 * A nested `SafeAreaProvider` would start with the parent's (zero) insets and
 * switch to the real ones a frame later, making the content jump. Hiding the
 * parent insets makes the provider wait for the modal's own measurement
 * before rendering its children.
 */
export const ModalSafeAreaProvider: FC<{ children: ReactNode }> = ({
  children,
}) => (
  <SafeAreaInsetsContext.Provider value={null}>
    <SafeAreaProvider>{children}</SafeAreaProvider>
  </SafeAreaInsetsContext.Provider>
);
