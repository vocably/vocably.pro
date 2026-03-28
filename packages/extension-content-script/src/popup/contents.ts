import { detectExtensionPlatform } from '@vocably/browser';
import {
  AddCardPayload,
  BatchUnitOfSpeechAnalyzePayload,
  GoogleLanguage,
  RateInteractionPayload,
  RemoveCardPayload,
} from '@vocably/model';
import { chunk, isString } from 'lodash-es';
import { api } from '../api';
import { contentScriptConfiguration } from '../configuration';
import { playAudioPronunciation } from '../playAudioPronunciation';

type Options = {
  popup: HTMLElement;
  source: string;
  detectedLanguage: GoogleLanguage | undefined;
  autoPlay: boolean;
  context?: string;
  initiator?: string;
};

export type TearDown = () => void;

const getLocaleLanguage = (): string => {
  if (!window?.navigator?.language) {
    return 'en';
  }

  return window.navigator.language.substring(0, 2);
};

export const setContents = async ({
  popup,
  source,
  detectedLanguage,
  context,
  autoPlay,
  initiator,
}: Options): Promise<TearDown> => {
  let intervalId: ReturnType<typeof setInterval> | undefined = undefined;
  let waitForPaymentIntervalId: ReturnType<typeof setInterval> | undefined =
    undefined;
  let explicitlySetLanguage: GoogleLanguage | null = null;
  let tornDown = false;

  const tearDown = () => {
    tornDown = true;
    clearInterval(intervalId);
    intervalId = undefined;
    clearInterval(waitForPaymentIntervalId);
    waitForPaymentIntervalId = undefined;
  };

  const setTranslation = async () => {
    const userKnowsHowToAdd = await api.isUserKnowsHowToAdd();
    const extensionPlatform = detectExtensionPlatform();
    const translation = document.createElement('vocably-translation');
    translation.phrase = source;
    translation.playAudioPronunciation = playAudioPronunciation;
    translation.extensionPlatform = extensionPlatform;
    translation.canCongratulate =
      contentScriptConfiguration.allowFirstTranslationCongratulation &&
      !userKnowsHowToAdd;

    type AnalyzePayload = {
      sourceLanguage?: GoogleLanguage;
      targetLanguage?: GoogleLanguage;
    };

    const analyze = async ({
      sourceLanguage,
      targetLanguage,
    }: AnalyzePayload = {}) => {
      translation.loading = true;

      const [translationResult, cardsLimit] = await Promise.all([
        api.analyze({
          source,
          // @ts-ignore
          sourceLanguage,
          targetLanguage,
          context,
          initiator: initiator ?? 'content-script',
        }),
        api.getCardsLimit(),
      ]);

      translation.cardsLimit = cardsLimit;
      translation.loading = false;

      if (translationResult.success === false) {
        console.error('Analyze error', translationResult);
      }

      if (contentScriptConfiguration.askForRatingEnabled) {
        api
          .askForRating({
            translationResult: translationResult,
            extensionPlatform: extensionPlatform.platform,
          })
          .then((result) => {
            translation.askForRating = result;
          });
      }

      translation.result = translationResult;
      if (translationResult.success === true) {
        translation.sourceLanguage = translationResult.value.sourceLanguage;

        translation.targetLanguage = translationResult.value.targetLanguage;

        if (autoPlay) {
          setTimeout(() => {
            translation.play();
          }, 50);
        }
      }

      const fetchExplanationItems = async (
        payload: BatchUnitOfSpeechAnalyzePayload
      ) => {
        const batchSize = 5;
        const { unitsOfSpeech, ...rest } = payload;

        translation.isLoadingExtraWords = true;
        for (let batch of chunk(unitsOfSpeech, batchSize)) {
          if (tornDown) break;

          const result = await api.analyzeUnitsOfSpeech({
            ...rest,
            unitsOfSpeech: batch,
          });

          if (tornDown) break;

          if (
            result.success &&
            result.value.items.length > 0 &&
            translation.result &&
            translation.result.success
          ) {
            translation.result = {
              success: true,
              value: {
                ...translation.result.value,
                extraItems: [
                  ...(translation.result.value.extraItems ?? []),
                  ...result.value.items,
                ],
              },
            };
          }
        }
        translation.isLoadingExtraWords = false;
      };

      if (
        translationResult.success === true &&
        translationResult.value.isDirect &&
        (translationResult.value.detectedInputType === 'sentence' ||
          translationResult.value.detectedInputType === 'phrase')
      ) {
        translation.explanation = { state: 'loading' };
        api
          .explain({
            sourceLanguage: translationResult.value.sourceLanguage,
            targetLanguage: translationResult.value.targetLanguage,
            source: translationResult.value.source,
          })
          .then((result) => {
            if (result.success === true && result.value.explanation) {
              translation.explanation = {
                state: 'loaded',
                value: result.value.explanation,
              };

              fetchExplanationItems({
                sourceLanguage: translationResult.value.sourceLanguage,
                targetLanguage: translationResult.value.targetLanguage,
                unitsOfSpeech: result.value.unitsOfSpeech,
              });
            } else if (result.success === true && !result.value.explanation) {
              translation.explanation = { state: 'none' };
            } else {
              translation.explanation = {
                state: 'error',
                error: 'Unable to load AI explanation.',
              };
            }
          });
      }

      const existingLanguagesResult = await api.listLanguages();
      translation.existingSourceLanguages = existingLanguagesResult.success
        ? existingLanguagesResult.value
        : [];
      const existingTargetLanguages = await api.listTargetLanguages();
      if (extensionPlatform.paymentLink === 'web') {
        translation.paymentLink = contentScriptConfiguration.webPaymentLink;
      } else if (isString(extensionPlatform.paymentLink)) {
        translation.paymentLink = extensionPlatform.paymentLink;
      } else {
        translation.paymentLink = '';
      }

      translation.existingTargetLanguages = existingTargetLanguages;
    };

    translation.updateCard = api.updateCard;
    translation.attachTag = api.attachTag;
    translation.detachTag = api.detachTag;
    translation.deleteTag = api.deleteTag;
    translation.updateTag = api.updateTag;

    // @ts-ignore
    translation.addEventListener(
      'changeSourceLanguage',
      ({ detail: sourceLanguage }: CustomEvent) => {
        api.saveLocationLanguage([window.location.toString(), sourceLanguage]);
        translation.sourceLanguage = sourceLanguage;
        analyze({
          sourceLanguage,
        });
      }
    );

    translation.addEventListener('watchMePaying', () => {
      waitForPaymentIntervalId = setInterval(async () => {
        const cardsLimit = await api.getCardsLimit();
        translation.cardsLimit = cardsLimit;
        if (cardsLimit === 'unlimited') {
          clearInterval(waitForPaymentIntervalId);
          waitForPaymentIntervalId = undefined;
        }
      }, 10_000);
    });

    translation.addEventListener('retry', async () => {
      translation.isRetrying = true;
      await analyze();
      translation.isRetrying = false;
    });

    // @ts-ignore
    translation.addEventListener(
      'changeTargetLanguage',
      ({ detail: targetLanguage }: CustomEvent) => {
        translation.targetLanguage = targetLanguage;
        analyze({
          targetLanguage,
        });
      }
    );

    // @ts-ignore
    translation.addEventListener(
      'removeCard',
      async ({ detail: payload }: CustomEvent<RemoveCardPayload>) => {
        translation.isUpdating = payload.card;
        translation.result = await api.removeCard(payload);
        translation.isUpdating = null;
        await api.setUserKnowsHowToAdd(true);
      }
    );

    // @ts-ignore
    translation.addEventListener(
      'addCard',
      async ({ detail: payload }: CustomEvent<AddCardPayload>) => {
        translation.isUpdating = payload.card;
        translation.result = await api.addCard(payload);
        translation.isUpdating = null;
        await api.setUserKnowsHowToAdd(true);
      }
    );

    // @ts-ignore
    translation.addEventListener(
      'ratingInteraction',
      async ({ detail: payload }: CustomEvent<RateInteractionPayload>) => {
        await api.saveAskForRatingResponse({
          extensionPlatform: extensionPlatform.platform,
          rateInteraction: payload,
        });
      }
    );

    analyze({
      sourceLanguage: explicitlySetLanguage ?? detectedLanguage,
    });

    popup.innerHTML = '';
    popup.appendChild(translation);
  };

  let timerElapsed = false;

  const isAlright = (): Promise<
    [boolean, GoogleLanguage | null, GoogleLanguage | null]
  > => {
    return Promise.all([
      api.isLoggedIn(),
      api.getInternalSourceLanguage(),
      api.getInternalProxyLanguage(),
    ]);
  };

  const [isLoggedIn, internalSourceLanguage, internalTargetLanguage] =
    await isAlright();

  if (isLoggedIn && internalSourceLanguage && internalTargetLanguage) {
    await setTranslation();
    return tearDown;
  }

  const alert = document.createElement('div');

  const updateAlertMessage = async (
    isLoggedIn: boolean,
    internalSourceLanguage: GoogleLanguage | null,
    internalTargetLanguage: GoogleLanguage | null
  ) => {
    if (!isLoggedIn) {
      if (alert.dataset.message !== 'sign-in') {
        alert.dataset.message = 'sign-in';
        alert.innerHTML = '';
        const signInElement = document.createElement('vocably-sign-in');

        signInElement.addEventListener('confirm', () => {
          closeWindow();
          windowProxy = window.open(`${api.appBaseUrl}/hands-free`, '_blank');
          windowProxy && windowProxy.focus();
        });

        alert.appendChild(signInElement);
      }
      return;
    }

    if (!internalSourceLanguage || !internalTargetLanguage) {
      if (alert.dataset.message !== 'proxy-language') {
        alert.dataset.message = 'proxy-language';
        alert.innerHTML = '';
        const languageForm = document.createElement('vocably-language');
        languageForm.sourceLanguage =
          internalSourceLanguage ?? detectedLanguage ?? 'en';
        languageForm.targetLanguage =
          internalTargetLanguage ?? getLocaleLanguage();

        // @ts-ignore
        languageForm.addEventListener('confirm', async (event: CustomEvent) => {
          languageForm.waiting = true;
          const { sourceLanguage, targetLanguage } = event.detail;
          explicitlySetLanguage = sourceLanguage;
          await Promise.all([
            api.setInternalSourceLanguage(sourceLanguage),
            api.setInternalProxyLanguage(targetLanguage),
          ]);
        });

        alert.appendChild(languageForm);
      }
    }
  };

  await updateAlertMessage(
    isLoggedIn,
    internalSourceLanguage,
    internalTargetLanguage
  );

  let windowProxy: WindowProxy | null = null;

  const closeWindow = () => {
    if (windowProxy !== null) {
      windowProxy.close();
      windowProxy = null;
    }
  };

  intervalId = setInterval(async () => {
    const [isLoggedIn, internalSourceLanguage, internalTargetLanguage] =
      await isAlright();
    if (isLoggedIn && internalSourceLanguage && internalTargetLanguage) {
      clearInterval(intervalId);
      intervalId = undefined;
      await setTranslation();
      setTimeout(closeWindow, 3000);
    } else {
      await updateAlertMessage(
        isLoggedIn,
        internalSourceLanguage,
        internalTargetLanguage
      );
    }
  }, 1000);

  popup.innerHTML = '';
  popup.appendChild(alert);

  return tearDown;
};
