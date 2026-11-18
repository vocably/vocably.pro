import {
  analyze as authenticatedAnalyze,
  explain as authenticatedExplain,
  loadLanguageDeck,
  publicAnalyze,
  publicAnalyzeUnitsOfSpeech,
  publicExplain,
  tts,
} from '@vocably/api';
import { detectLocale } from '@vocably/browser-i18n';
import { registerContentScript } from '@vocably/extension-content-script';
import type { ExtensionSettings } from '@vocably/extension-messages';
import {
  GoogleLanguage,
  isGoogleLanguage,
  Result,
  TranslationCards,
} from '@vocably/model';
import { analysisToTranslationCards } from '@vocably/model-operations';
import { searchConfig } from './constants';
import { getPreferredTargetLanguage } from './preferredLanguages';
import { getCardsLimit } from './search/cardsLimit';
import {
  addCard,
  attachTag,
  deleteTag,
  detachTag,
  removeCard,
  updateCard,
  updateTag,
} from './search/deck';
import { configureDeckApi, isLoggedIn, isSignedIn } from './user';

/**
 * Lets visitors try Vocably right on this website: selecting any word or
 * phrase opens the very popup the extension shows, without installing it.
 *
 * The content script talks to the extension's service worker through the
 * `api` object it is configured with. Here that object is backed by the
 * website instead: the public API for visitors who are signed out, and the
 * session the app keeps on this origin, plus the deck operations the search
 * page already uses, for those who are signed in. Preferences live in
 * `localStorage`, shared with the search page.
 */

type ContentScriptApi = Parameters<typeof registerContentScript>[0]['api'];
type AnalyzeRequest = Parameters<NonNullable<ContentScriptApi['analyze']>>[0];

const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private windows and blocked site data: the choice lasts for this page.
  }
};

const getPageLanguage = (): GoogleLanguage | null => {
  const pageLanguage = document.documentElement.lang.substring(0, 2);
  return isGoogleLanguage(pageLanguage) ? pageLanguage : null;
};

const getSourceLanguage = (): GoogleLanguage => {
  const stored = readStorage(searchConfig.sourceLanguageLocalStorageKey);
  if (isGoogleLanguage(stored ?? '')) {
    return stored as GoogleLanguage;
  }

  return getPageLanguage() ?? 'en';
};

const setSourceLanguage = async (language: GoogleLanguage) =>
  writeStorage(searchConfig.sourceLanguageLocalStorageKey, language);

const setTargetLanguage = async (language: GoogleLanguage) =>
  writeStorage(searchConfig.targetLanguageLocalStorageKey, language);

// The extension asks a newcomer to pick both languages before the first
// translation. A visitor trying it out gets sensible defaults instead, and can
// change either right in the popup.
const settings: ExtensionSettings = {
  showOnDoubleClick: false,
  showOnSelection: false,
  autoPlay: false,
  hideSelectionButton: false,
  // The language of the selected text wins over the last used one, so that
  // the German examples on an English page are looked up as German.
  autodetectLanguage: true,
  showOnHotKey: false,
  locale: detectLocale(),
};

const analyze = async (
  payload: AnalyzeRequest
): Promise<Result<TranslationCards>> => {
  if (payload.sourceLanguage) {
    await setSourceLanguage(payload.sourceLanguage);
  }

  if (payload.targetLanguage) {
    await setTargetLanguage(payload.targetLanguage);
  }

  const analyzePayload = {
    ...payload,
    sourceLanguage: payload.sourceLanguage ?? getSourceLanguage(),
    targetLanguage: payload.targetLanguage ?? getPreferredTargetLanguage(),
  };

  // A signed out visitor has no collection: every card comes out as addable,
  // and adding one asks them to sign in.
  if (!(await isSignedIn())) {
    const analysisResult = await publicAnalyze(analyzePayload);

    if (analysisResult.success === false) {
      return analysisResult;
    }

    return {
      success: true,
      value: analysisToTranslationCards(analysisResult.value),
    };
  }

  const [analysisResult, deckResult] = await Promise.all([
    authenticatedAnalyze(analyzePayload),
    loadLanguageDeck(analyzePayload.sourceLanguage),
  ]);

  if (analysisResult.success === false) {
    return analysisResult;
  }

  if (deckResult.success === false) {
    return deckResult;
  }

  return {
    success: true,
    value: analysisToTranslationCards(analysisResult.value, deckResult.value),
  };
};

const api: ContentScriptApi = {
  // Signing in and paying both happen in the app, served from this origin.
  appBaseUrl: `${window.location.origin}/app`,

  ping: async () => 'pong',

  getSettings: async () => settings,

  isLoggedIn: async () => {
    const result = await isLoggedIn();
    return result.success && result.value;
  },

  getInternalSourceLanguage: async () => getSourceLanguage(),
  setInternalSourceLanguage: setSourceLanguage,
  getInternalProxyLanguage: async () => getPreferredTargetLanguage(),
  setInternalProxyLanguage: setTargetLanguage,

  // Per site languages make no sense on a single site.
  getLocationLanguage: async () => null,
  saveLocationLanguage: async () => undefined,

  analyze,
  explain: async (payload) =>
    (await isSignedIn())
      ? authenticatedExplain(payload)
      : publicExplain(payload),
  analyzeUnitsOfSpeech: publicAnalyzeUnitsOfSpeech,

  listLanguages: async () => {
    // Nothing to list without a collection.
    if (!(await isSignedIn())) {
      return { success: true, value: [] };
    }

    return { success: true, value: [getSourceLanguage()] };
  },
  listTargetLanguages: async () => [getPreferredTargetLanguage()],

  loadLanguageDeck,
  getCardsLimit,
  addCard,
  removeCard,
  updateCard,
  attachTag,
  detachTag,
  updateTag,
  deleteTag,

  isUserKnowsHowToAdd: async () =>
    readStorage(searchConfig.knowsHowToAddLocalStorageKey) !== null,
  setUserKnowsHowToAdd: async (value) => {
    if (value) {
      writeStorage(searchConfig.knowsHowToAddLocalStorageKey, 'true');
    }
  },

  canPlayOffScreen: async () => false,
  getAudioPronunciation: async (payload) => {
    const result = await tts(window['apiBaseUrl'], payload);

    if (result.success === false) {
      return result;
    }

    return {
      success: true,
      value: { url: 'data:audio/mpeg;base64,' + result.value.audioContent },
    };
  },

  // Rating prompts are about the extension stores.
  askForRating: async () => false,
  saveAskForRatingResponse: async () => undefined,

  // PostHog is only loaded once somebody actually votes.
  qualityVote: async (payload) => {
    const { captureQualityVote } = await import('./posthog');
    await captureQualityVote(payload);
  },
};

/**
 * The layout puts `vocably-extension-disabled` on every page, which keeps an
 * installed extension's content script out, so this copy is the only one.
 */
export const registerWebsiteContentScript = async () => {
  // Every deck call needs the API configured, and signed out visitors still
  // use its public endpoints.
  await configureDeckApi();

  await registerContentScript({
    api,
    youTube: { ytHosts: [] },
    contentScript: {
      askForRatingEnabled: false,
      // Touch screens have no mouseup to show the button on.
      displayMobileLookupButton: window.matchMedia('(pointer: coarse)').matches,
      allowFirstTranslationCongratulation: true,
      webPaymentLink: `${window.location.origin}/app/subscribe`,
      paymentLink: `${window.location.origin}/app/subscribe`,
    },
  });
};
