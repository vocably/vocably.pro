import { FC, PropsWithChildren, useEffect } from 'react';
import { AppState } from 'react-native';
import { recalibrateNotifications } from './recalibrateNotifications';

type Props = {};

export const NotificationsContainer: FC<PropsWithChildren<Props>> = ({
  children,
}) => {
  useEffect(() => {
    const onAppChangeListener = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (nextAppState === 'active') {
          recalibrateNotifications().then().catch(console.error);
        }
      }
    );

    const timeOutId = setTimeout(
      () => recalibrateNotifications().then().catch(console.error),
      2000
    );

    return () => {
      onAppChangeListener.remove();
      clearTimeout(timeOutId);
    };
  }, []);

  return <>{children}</>;
};
