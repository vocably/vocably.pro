import { StudyFlowType } from './study-flow';

export type Platform =
  | 'ios'
  | 'android'
  | 'chromeExtension'
  | 'edgeExtension'
  | 'safariExtension';
export type RateInteractionPayload = 'never' | 'later' | 'feedback' | 'review';
export type RateResponse = {
  response: RateInteractionPayload;
  isoDate: string;
};

export type OnboardingFlow = {
  allowed: boolean;
  extensionSent: boolean;
  mobileAppSent: boolean;
  language: string | null;
};

export type Locale = 'en' | 'ru' | 'uk' | 'vi' | 'tr' | 'es' | 'pt' | 'zh-TW';

export const locales: Locale[] = [
  'en',
  'ru',
  'uk',
  'vi',
  'tr',
  'es',
  'pt',
  'zh-TW',
];

/**
 * Maps a BCP 47 tag ("ru-RU", "PT", "zh-Hant-HK") to a supported interface
 * locale. Only Traditional Chinese is supported, so Simplified tags
 * ("zh", "zh-CN", "zh-Hans") resolve to nothing.
 */
export const parseLocale = (
  tag: string | null | undefined
): Locale | undefined => {
  const parts = (tag ?? '').toLowerCase().split(/[-_]/);

  if (parts[0] === 'zh') {
    return parts.some((part) => ['hant', 'tw', 'hk', 'mo'].includes(part))
      ? 'zh-TW'
      : undefined;
  }

  return locales.find((locale) => locale === parts[0]);
};

export type UserMetadata = {
  onboardingFlow: OnboardingFlow;
  rate: Record<Platform, RateResponse | undefined>;
  studyFlow?: StudyFlowType[];
  defaultTranslationLanguage?: string;
  lastUpdated: number;
  interfaceLanguage?: Locale;
};

export type PartialUserMetadata = {
  rate?: Partial<UserMetadata['rate']>;
  onboardingFlow?: Partial<UserMetadata['onboardingFlow']>;
  studyFlow?: UserMetadata['studyFlow'];
  lastUpdated?: UserMetadata['lastUpdated'];
  defaultTranslationLanguage?: UserMetadata['defaultTranslationLanguage'];
  interfaceLanguage?: UserMetadata['interfaceLanguage'];
};

export const defaultUserMetadata: UserMetadata = {
  onboardingFlow: {
    allowed: false,
    extensionSent: true,
    mobileAppSent: true,
    language: null,
  },
  rate: {
    ios: undefined,
    android: undefined,
    chromeExtension: undefined,
    edgeExtension: undefined,
    safariExtension: undefined,
  },
  lastUpdated: 0,
};

export const mergeUserMetadata = (
  md1: UserMetadata,
  md2: PartialUserMetadata
): UserMetadata => {
  return {
    ...md1,
    ...md2,
    rate: {
      ...md1.rate,
      ...md2.rate,
    },
    onboardingFlow: {
      ...md1.onboardingFlow,
      ...md2.onboardingFlow,
    },
  };
};

export const mapUserMetadata = (metadata: any): UserMetadata => {
  return mergeUserMetadata(defaultUserMetadata, metadata);
};
