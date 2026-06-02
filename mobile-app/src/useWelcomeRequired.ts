import { useTranslationPreset } from './TranslationPreset/useTranslationPreset';
import { AsyncResult } from './useAsync';
import { usePostHog } from 'posthog-react-native';

export const useWelcomeRequired = (): AsyncResult<boolean> => {
  const preset = useTranslationPreset();
  const posthog = usePostHog();

  if (preset.status !== 'known') {
    return {
      status: 'loading',
    };
  }

  const isRequired =
    !preset.preset.sourceLanguage || !preset.preset.translationLanguage;

  if (isRequired) {
    posthog.capture('welcomeRequired', {
      preset: preset.preset,
    });
  }

  return {
    status: 'loaded',
    value: isRequired,
  };
};
