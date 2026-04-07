import { StudyFlowType } from './study-flow';

export type Platform =
  | 'ios'
  | 'android'
  | 'chromeExtension'
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

export type Locale = 'en' | 'ru' | 'uk' | 'vi' | 'tr' | 'es' | 'pt';

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
