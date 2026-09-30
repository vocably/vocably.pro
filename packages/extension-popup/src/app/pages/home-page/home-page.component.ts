import { NgIf } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslatePipe } from '../../translate.pipe';
import { detectExtensionPlatform } from '@vocably/browser';
import { SearchValues } from '@vocably/extension-content-ui/src/components/search-form/types';
import {
  AddCardPayload,
  AttachTagPayload,
  AudioPronunciationPayload,
  BatchUnitOfSpeechAnalyzePayload,
  DeleteTagPayload,
  DetachTagPayload,
  isGoogleLanguage,
  LanguagePairs,
  RemoveCardPayload,
  Result,
  TranslationCards,
  UpdateCardPayload,
  UpdateTagPayload,
  CardsLimit,
  GoogleLanguage,
} from '@vocably/model';
import { chunk, first, isString } from 'lodash-es';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { detectTargetLanguage } from '../../../detectTargetLanguage';
import { isUserLoggedIn$ } from '../../../isUserLoggedIn';
import { playDataUrl } from './playDataUrl';

const lastUsedSearchValuesKey = 'lastUsedSearchValues_01';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NgIf, IonicModule, RouterLink, MatIcon, TranslatePipe],
})
export class HomePageComponent implements OnInit, OnDestroy {
  welcomeUrl = `${environment.appBaseUrl}/welcome`;
  signInUrl = `${environment.appBaseUrl}/hands-free`;
  isLoggedIn: boolean | null = null;
  isSavingLanguages = false;
  defaultTargetLanguage: GoogleLanguage = detectTargetLanguage();
  isSearching: boolean = false;
  isTranslationLoading: boolean = false;
  searchResult: Result<TranslationCards> | null = null;
  cardsLimit: CardsLimit = {
    maxCards: 50,
    cardsPerDay: 1,
  };
  paymentLink: string = '';
  extensionPlatform = detectExtensionPlatform();
  askForRating: boolean = false;
  isRetrying = false;

  languagePairsLoaded = false;
  languagePairs: LanguagePairs = {};
  needsOnboarding = false;

  searchValues: SearchValues | null = null;

  explanationState: any = {
    state: 'none',
  };
  explanationAnimationDelay = 0;
  isLoadingExtraWords = false;

  private isLoggedInSubscription: Subscription | undefined;

  constructor() {}

  ngOnInit(): void {
    this.searchValues = JSON.parse(
      localStorage.getItem(lastUsedSearchValuesKey) ?? 'null'
    );

    if (this.searchValues !== null) {
      this.searchValues.text = '';
    }

    // Translating works signed out too. Adding a card asks to sign in, and a
    // session that shows up later only changes what the Learn button does.
    this.isLoggedInSubscription = isUserLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });

    this.loadLanguagePairs();

    if (this.extensionPlatform.paymentLink === 'web') {
      this.paymentLink = environment.appBaseUrl + '/subscribe';
    } else if (isString(this.extensionPlatform.paymentLink)) {
      this.paymentLink = this.extensionPlatform.paymentLink;
    } else {
      this.paymentLink = '';
    }
  }

  ngOnDestroy(): void {
    this.isLoggedInSubscription?.unsubscribe();
  }

  private loadLanguagePairs() {
    return environment.getLanguagePairs().then((languagePairs) => {
      this.languagePairs = languagePairs;
      this.languagePairsLoaded = true;
      this.needsOnboarding = Object.keys(languagePairs).length === 0;

      if (
        this.searchValues !== null ||
        Object.keys(languagePairs).length === 0
      ) {
        return;
      }

      const pair = first(Object.entries(languagePairs));

      if (!pair || !pair[0] || !pair[1] || !isGoogleLanguage(pair[0])) {
        return;
      }

      this.searchValues = {
        sourceLanguage: pair[0],
        isReversed: false,
        text: '',
        targetLanguage: pair[1].currentTargetLanguage,
      };
    });
  }

  /**
   * The welcome page in the app sets the languages up for a signed in user.
   * A signed out one picks them right here instead.
   */
  async onLanguagesConfirm({ detail }: any) {
    const { sourceLanguage, targetLanguage } = detail;

    if (
      !isGoogleLanguage(sourceLanguage) ||
      !isGoogleLanguage(targetLanguage)
    ) {
      return;
    }

    this.isSavingLanguages = true;
    // The source language goes first: the proxy language is stored as a pair
    // with whatever the source language is at that moment.
    await environment.setInternalSourceLanguage(sourceLanguage);
    await environment.setInternalProxyLanguage(targetLanguage);
    await this.loadLanguagePairs();
    this.isSavingLanguages = false;
  }

  // Emitted by `vocably-sign-in` in the cover shown when a signed out user
  // tries to add a card. Opening the tab closes this popup, so the card is not
  // added afterwards: the user searches again once signed in.
  onSignIn() {
    window.open(this.signInUrl, '_blank');
  }

  onSearchValuesChanged(values: any) {
    localStorage.setItem(lastUsedSearchValuesKey, JSON.stringify(values));
    this.searchValues = values;
  }

  async onRetry() {
    if (!this.searchValues) {
      return;
    }

    this.isRetrying = true;
    await this.onSearchFormSubmit(this.searchValues);
    this.isRetrying = false;
  }

  async onSearchFormSubmit(values: any) {
    localStorage.setItem(lastUsedSearchValuesKey, JSON.stringify(values));
    this.searchValues = values;

    if (this.isSearching) {
      return;
    }

    this.isSearching = true;

    const [analyzeResult, cardsLimit] = await Promise.all([
      environment.analyze(
        values.isReversed
          ? {
              target: values.text,
              sourceLanguage: values.sourceLanguage,
              targetLanguage: values.targetLanguage,
              initiator: 'popup',
            }
          : {
              source: values.text,
              sourceLanguage: values.sourceLanguage,
              targetLanguage: values.targetLanguage,
              initiator: 'popup',
            }
      ),
      environment.getCardsLimit(),
    ]);

    this.searchResult = analyzeResult;
    this.cardsLimit = cardsLimit;

    this.isSearching = false;

    this.explanationState = {
      state: 'none',
    };

    if (analyzeResult.success === false) {
      return;
    }

    environment
      .askForRating({
        translationResult: analyzeResult,
        extensionPlatform: this.extensionPlatform.platform,
      })
      .then((result) => {
        this.askForRating = result;
      });

    if (
      analyzeResult.value.isDirect &&
      (analyzeResult.value.detectedInputType === 'sentence' ||
        analyzeResult.value.detectedInputType === 'phrase')
    ) {
      this.explanationState = {
        state: 'loading',
      };

      environment
        .explain({
          sourceLanguage: analyzeResult.value.sourceLanguage,
          targetLanguage: analyzeResult.value.targetLanguage,
          source: analyzeResult.value.source,
        })
        .then((explanationResult) => {
          if (explanationResult.success === false) {
            this.explanationState = {
              state: 'error',
              error: 'Unable to load AI explanation.',
            };
            return;
          }

          if (explanationResult.value.explanation.trim() === '') {
            this.explanationState = {
              state: 'none',
            };
            return;
          }

          this.explanationState = {
            state: 'loaded',
            value: explanationResult.value.explanation,
          };

          this.fetchExplanationItems({
            sourceLanguage: analyzeResult.value.sourceLanguage,
            targetLanguage: analyzeResult.value.targetLanguage,
            unitsOfSpeech: explanationResult.value.unitsOfSpeech,
          });
        });
    }
  }

  async fetchExplanationItems(payload: BatchUnitOfSpeechAnalyzePayload) {
    const batchSize = 5;
    const { unitsOfSpeech, ...rest } = payload;

    this.isLoadingExtraWords = true;
    for (const batch of chunk(unitsOfSpeech, batchSize)) {
      const result = await environment.analyzeUnitsOfSpeech({
        ...rest,
        unitsOfSpeech: batch,
      });

      if (
        result.success &&
        result.value.items.length > 0 &&
        this.searchResult &&
        this.searchResult.success
      ) {
        this.searchResult = {
          success: true,
          value: {
            ...this.searchResult.value,
            extraItems: [
              ...(this.searchResult.value.extraItems ?? []),
              ...result.value.items,
            ],
          },
        };
      }
    }
    this.isLoadingExtraWords = false;
  }

  async addCard(event: any) {
    if (!event.detail) {
      console.error('Add card: Undefined event', event);
      return;
    }

    this.isTranslationLoading = true;
    const payload: AddCardPayload = event.detail;
    this.searchResult = await environment.addCard(payload);
    this.isTranslationLoading = false;
  }
  async removeCard(event: any) {
    if (!event.detail) {
      console.error('Remove card: Undefined event', event);
      return;
    }

    this.isTranslationLoading = true;
    const payload: RemoveCardPayload = event.detail;
    this.searchResult = await environment.removeCard(payload);
    this.isTranslationLoading = false;
  }
  async attachTag(payload: AttachTagPayload) {
    this.isTranslationLoading = true;
    this.searchResult = await environment.attachTag(payload);
    this.isTranslationLoading = false;
    return this.searchResult;
  }
  async detachTag(payload: DetachTagPayload) {
    this.isTranslationLoading = true;
    this.searchResult = await environment.detachTag(payload);
    this.isTranslationLoading = false;
    return this.searchResult;
  }
  async deleteTag(payload: DeleteTagPayload) {
    this.isTranslationLoading = true;
    this.searchResult = await environment.deleteTag(payload);
    this.isTranslationLoading = false;
    return this.searchResult;
  }
  async updateTag(payload: UpdateTagPayload) {
    this.isTranslationLoading = true;
    this.searchResult = await environment.updateTag(payload);
    this.isTranslationLoading = false;
    return this.searchResult;
  }
  async updateCard(payload: UpdateCardPayload) {
    this.searchResult = await environment.updateCard(payload);
    return this.searchResult;
  }
  async playAudioPronunciation(
    payload: AudioPronunciationPayload
  ): Promise<Result<true>> {
    const result = await environment.getAudioPronunciation(payload);
    if (result.success === false) {
      return result;
    }

    return playDataUrl(result.value.url);
  }

  async saveAskForRating({ detail: payload }: any) {
    await environment.saveAskForRatingResponse({
      extensionPlatform: this.extensionPlatform.platform,
      rateInteraction: payload,
    });
  }
}
