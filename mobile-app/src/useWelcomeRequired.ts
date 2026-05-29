import { useContext } from 'react';
import { LanguagesContext } from './languages/LanguagesContainer';
import { useTranslationPreset } from './TranslationPreset/useTranslationPreset';
import { AsyncResult } from './useAsync';
import { usePostHog } from 'posthog-react-native';

export const useWelcomeRequired = (): AsyncResult<boolean> => {
  const { status, languages } = useContext(LanguagesContext);
  const preset = useTranslationPreset();
  const posthog = usePostHog();

  if (status !== 'loaded') {
    return {
      status: 'loading',
    };
  }

  if (preset.status !== 'known') {
    return {
      status: 'loading',
    };
  }

  const isRequired =
    languages.length === 0 ||
    !preset.preset.sourceLanguage ||
    !preset.preset.translationLanguage;

  if (isRequired) {
    posthog.capture('welcomeRequired', {
      languages,
      preset: preset.preset,
    });
  }

  return {
    status: 'loaded',
    value: isRequired,
  };
};
