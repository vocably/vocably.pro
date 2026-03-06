import { createExternalMessage, createMessage } from '@vocably/hermes';
import {
  AddCardPayload,
  AttachTagPayload,
  AudioPronunciationPayload,
  AudioPronunciationResponse,
  DeleteTagPayload,
  DetachTagPayload,
  DirectAnalyzePayload,
  ExplainPayload,
  Explanation,
  GoogleLanguage,
  LanguagePairs,
  RateInteractionPayload,
  RemoveCardPayload,
  Result,
  ReverseAnalyzePayload,
  TranslationCards,
  UpdateCardPayload,
  UpdateTagPayload,
} from '@vocably/model';

const createScope =
  (scope: string): typeof createMessage =>
  (identifier: string) =>
    createMessage(`${scope}.${identifier}`);

const createScopedMessage = createScope('vocably');

export const [isLoggedIn, onIsLoggedInRequest] = createScopedMessage<
  void,
  boolean
>('isLoggedIn');

export type Locale = 'en' | 'ru' | 'uk' | 'vi' | 'tr';

export type ExtensionSettings = {
  showOnDoubleClick: boolean;
  autoPlay: boolean;
  hideSelectionButton: boolean;
  autodetectLanguage: boolean;
  showOnHotKey: boolean;
  locale: Locale;
};

export const [getSettings, onGetSettingsRequest] = createScopedMessage<
  void,
  ExtensionSettings
>('getSettings');

export const [setSettings, onSetSettingsRequest] = createScopedMessage<
  Partial<ExtensionSettings>,
  ExtensionSettings
>('setSettings');

export const [isActive, onIsActiveRequest] = createScopedMessage<void, boolean>(
  'isActive'
);

export const [isEligibleForTrial, onIsEligibleForTrialRequest] =
  createScopedMessage<void, boolean>('isEligibleForTrial');

export const [getMaxCards, onGetMaxCardsRequest] = createScopedMessage<
  void,
  number | 'unlimited'
>('getMaxCards');

export const [getUserEmail, onGetUserEmail] = createScopedMessage<
  void,
  Result<string>
>('getUserEmail');

type AnalyzePayload = (
  | (Omit<DirectAnalyzePayload, 'targetLanguage'> &
      Partial<DirectAnalyzePayload>)
  | ReverseAnalyzePayload
) & {
  initiator: string;
};

export const [analyze, onAnalyzeRequest] = createScopedMessage<
  AnalyzePayload,
  Result<TranslationCards>
>('analyze');

export const [explain, onExplainRequest] = createScopedMessage<
  ExplainPayload,
  Result<Explanation>
>('explain');

export const [removeCard, onRemoveCardRequest] = createScopedMessage<
  RemoveCardPayload,
  Result<TranslationCards>
>('removeCard');

export const [addCard, onAddCardRequest] = createScopedMessage<
  AddCardPayload,
  Result<TranslationCards>
>('addCard');

export const [listLanguages, onListLanguagesRequest] = createScopedMessage<
  void,
  Result<GoogleLanguage[]>
>('listLanguages');

export const [listTargetLanguages, onListTargetLanguagesRequest] =
  createScopedMessage<void, GoogleLanguage[]>('listTargetLanguages');

export const [getLocationLanguage, onGetLocationLanguageRequest] =
  createScopedMessage<string, GoogleLanguage | null>('getLocationLanguage');

export const [saveLocationLanguage, onSaveLocationLanguageRequest] =
  createScopedMessage<[string, GoogleLanguage], void>('saveLocationLanguage');

export const [getLanguagePairs, onGetLanguagePairs] = createScopedMessage<
  void,
  LanguagePairs
>('getLanguagePairs');

export const [cleanUp, onCleanUpRequest] = createScopedMessage<
  TranslationCards,
  Result<null>
>('cleanUp');

export const [ping, onPing] = createScopedMessage<void, string>('ping');

export const [getInternalProxyLanguage, onGetInternalProxyLanuage] =
  createScopedMessage<void, GoogleLanguage | null>('getInternalProxyLanguage');

export const [setInternalProxyLanguage, onSetInternalProxyLanguage] =
  createScopedMessage<GoogleLanguage, void>('setInternalProxyLanguage');

export const [getInternalSourceLanguage, onGetInternalSourceLanguage] =
  createScopedMessage<void, GoogleLanguage | null>('getInternalSourceLanguage');

export const [setInternalSourceLanguage, onSetInternalSourceLanguage] =
  createScopedMessage<GoogleLanguage, void>('setInternalSourceLanguage');

export const [isUserKnowsHowToAdd, onIsUserKnowsHowToAdd] = createScopedMessage<
  void,
  boolean
>('isUserKnowsHowToAdd');

export const [setUserKnowsHowToAdd, onSetUserKnowsHowToAdd] =
  createScopedMessage<boolean, void>('setUserKnowsHowToAdd');

export const [pingExternal, onPingExternal] = createExternalMessage<
  void,
  string
>('vocably.ping-external');

export const [setProxyLanguage, onSetProxyLanguage] = createExternalMessage<
  GoogleLanguage,
  void
>('vocably.setProxyLanguage');

export const [getProxyLanguage, onGetProxyLanguage] = createExternalMessage<
  void,
  GoogleLanguage | null
>('vocably.getProxyLanguage');

export const [setSourceLanguage, onSetSourceLanguage] = createExternalMessage<
  GoogleLanguage,
  void
>('vocably.setSourceLanguage');

export const [getSourceLanguage, onGetSourceLanguage] = createExternalMessage<
  void,
  GoogleLanguage | null
>('vocably.getSourceLanguage');

export const [getAudioPronunciation, onGetAudioPronunciation] =
  createScopedMessage<
    AudioPronunciationPayload,
    Result<AudioPronunciationResponse>
  >('getAudioPronunciation');

export const [askForRating, onAskForRating] = createScopedMessage<
  {
    translationResult: Result<TranslationCards>;
    extensionPlatform:
      | 'chromeExtension'
      | 'safariExtension'
      | 'iosSafariExtension';
  },
  boolean
>('askForRating');

export const [saveAskForRatingResponse, onSaveAskForRatingResponse] =
  createScopedMessage<
    {
      extensionPlatform:
        | 'chromeExtension'
        | 'safariExtension'
        | 'iosSafariExtension';
      rateInteraction: RateInteractionPayload;
    },
    void
  >('askForRatingResponse');

export const [playAudioPronunciation, onPlayAudioPronunciation] =
  createScopedMessage<AudioPronunciationPayload, Result<true>>(
    'playAudioPronunciation'
  );

export const [
  playAudioPronunciationOffscreen,
  onPlayAudioPronunciationOffscreen,
] = createScopedMessage<AudioPronunciationPayload, Result<true>>(
  'playAudioPronunciationOffscreen'
);

export const [canPlayOffScreen, onCanPlayOffScreen] = createScopedMessage<
  void,
  boolean
>('canPlayOffScreen');

export const [updateCard, onUpdateCard] = createScopedMessage<
  UpdateCardPayload,
  Result<TranslationCards>
>('updateCard');

export const [attachTag, onAttachTag] = createScopedMessage<
  AttachTagPayload,
  Result<TranslationCards>
>('attachTag');

export const [detachTag, onDetachTag] = createScopedMessage<
  DetachTagPayload,
  Result<TranslationCards>
>('detachTag');

export const [updateTag, onUpdateTag] = createScopedMessage<
  UpdateTagPayload,
  Result<TranslationCards>
>('updateTag');

export const [deleteTag, onDeleteTag] = createScopedMessage<
  DeleteTagPayload,
  Result<TranslationCards>
>('deleteTag');
