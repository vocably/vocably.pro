import { Component, OnInit } from '@angular/core';
import { detectExtensionPlatform } from '@vocably/browser';
import { SearchValues } from '@vocably/extension-content-ui/src/components/search-form/types';
import {
  AddCardPayload,
  AttachTagPayload,
  AudioPronunciationPayload,
  DeleteTagPayload,
  DetachTagPayload,
  isGoogleLanguage,
  LanguagePairs,
  RemoveCardPayload,
  Result,
  TranslationCards,
  UpdateCardPayload,
  UpdateTagPayload,
} from '@vocably/model';
import { first, isString } from 'lodash-es';
import { environment } from '../../../environments/environment';
import { playDataUrl } from './playDataUrl';

const lastUsedSearchValuesKey = 'lastUsedSearchValues_01';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  standalone: false,
})
export class HomePageComponent implements OnInit {
  welcomeUrl = `${environment.appBaseUrl}/welcome`;
  isSearching: boolean = false;
  isTranslationLoading: boolean = false;
  searchResult: Result<TranslationCards> | null = null;
  maxCards: number | 'unlimited' = 50;
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

  constructor() {}

  ngOnInit(): void {
    this.searchValues = JSON.parse(
      localStorage.getItem(lastUsedSearchValuesKey) ?? 'null'
    );

    if (this.searchValues !== null) {
      this.searchValues.text = '';
    }

    environment.getLanguagePairs().then((languagePairs) => {
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

    if (this.extensionPlatform.paymentLink === 'web') {
      this.paymentLink = environment.appBaseUrl + '/subscribe';
    } else if (isString(this.extensionPlatform.paymentLink)) {
      this.paymentLink = this.extensionPlatform.paymentLink;
    } else {
      this.paymentLink = '';
    }
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

    const [analyzeResult, maxCards] = await Promise.all([
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
      environment.getMaxCards(),
    ]);

    this.searchResult = analyzeResult;
    this.maxCards = maxCards;

    if (analyzeResult.success === true) {
      environment
        .askForRating({
          translationResult: analyzeResult,
          extensionPlatform: this.extensionPlatform.platform,
        })
        .then((result) => {
          this.askForRating = result;
        });

      this.explanationState = {
        state: 'loading',
      };

      if (analyzeResult.value.source.trim().split(' ').length === 1) {
        this.explanationAnimationDelay = 2000;
      } else {
        this.explanationAnimationDelay = 0;
      }

      const source =
        analyzeResult.value.cards.length === 1
          ? analyzeResult.value.cards[0].data.source
          : analyzeResult.value.source;

      environment
        .explain({
          sourceLanguage: analyzeResult.value.sourceLanguage,
          targetLanguage: analyzeResult.value.targetLanguage,
          source: source,
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
        });
    }

    this.isSearching = false;
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
