import { ANALYTICS_DISABLED } from '@env';
import {
  PostHogOptions,
  PostHogProvider as OriginalPostHogProvider,
} from 'posthog-react-native';
import { FC, PropsWithChildren } from 'react';

type Props = {
  options?: PostHogOptions;
};

export const PostHogProvider: FC<PropsWithChildren<Props>> = ({
  children,
  options,
}) => {
  return (
    <OriginalPostHogProvider
      apiKey="phc_zSkRhQ7tE4RDFRdxIVXzWwJ66ACL9QAHnyrRpRknyHj"
      options={{
        ...options,
        host: 'https://api-e.vocably.pro',
        enableSessionReplay: false,
        disabled: ANALYTICS_DISABLED === 'true',
        disableGeoip: true,
        persistence: 'memory',
      }}
      autocapture={false}
    >
      {children}
    </OriginalPostHogProvider>
  );
};
