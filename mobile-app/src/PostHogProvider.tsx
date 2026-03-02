import { ANALYTICS_DISABLED } from '@env';
import {
  PostHogOptions,
  PostHogProvider as OriginalPostHogProvider,
} from 'posthog-react-native';
import { FC, PropsWithChildren } from 'react';
import { postHogCustomStorage } from './postHogCustomStorage';

type Props = {
  options?: PostHogOptions;
};

export const PostHogProvider: FC<PropsWithChildren<Props>> = ({
  children,
  options,
}) => {
  return (
    <OriginalPostHogProvider
      apiKey="phc_vke56i7RTlBbFYHZHsoH7VhgWi2DwvKtEzusfcFemgT"
      options={{
        ...options,
        host: 'https://us.i.posthog.com',
        customStorage: postHogCustomStorage,
        enableSessionReplay: false,
        disabled: ANALYTICS_DISABLED === 'true',
      }}
      autocapture={false}
    >
      {children}
    </OriginalPostHogProvider>
  );
};
