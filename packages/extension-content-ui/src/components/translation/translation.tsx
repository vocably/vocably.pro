import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  Fragment,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import {
  AddCardPayload,
  AttachTagPayload,
  AudioPronunciationPayload,
  CardsLimit,
  DeleteTagPayload,
  DetachTagPayload,
  GoogleLanguage,
  isGoogleTTSLanguage,
  languageList,
  RateInteractionPayload,
  RemoveCardPayload,
  Result,
  TranslationCard,
  TranslationCards,
  UpdateCardPayload,
  UpdateTagPayload,
} from '@vocably/model';
import showdown from 'showdown';
import { subscribeToLocale, t } from '../../i18n';
import { sortLanguages } from './sortLanguages';
import {
  createTranslationCards,
  getAddedToday,
} from '@vocably/model-operations';

const mdConverter = new showdown.Converter();

export type ComponentExplanationState =
  | {
      state: 'none';
    }
  | {
      state: 'loading';
    }
  | {
      state: 'loaded';
      value: string;
    }
  | {
      state: 'error';
      error: string;
    };

@Component({
  tag: 'vocably-translation',
  styleUrl: 'translation.scss',
  shadow: true,
})
export class VocablyTranslation {
  @Prop() phrase: string;
  @Prop() result: Result<TranslationCards> | null = null;
  @Prop() loading: boolean = false;
  @Prop() existingSourceLanguages: GoogleLanguage[] = [];
  @Prop() existingTargetLanguages: GoogleLanguage[] = [];
  @Prop() askForRating: boolean = false;
  @Prop() sourceLanguage: string = '';
  @Prop() targetLanguage: string = '';
  @Prop() isUpdating: TranslationCard | null = null;
  @Prop() canCongratulate: boolean = false;
  @Prop() playAudioPronunciation: (
    payload: AudioPronunciationPayload
  ) => Promise<Result<true>>;
  @Prop() extensionPlatform: {
    name: string;
    url: string;
    platform: 'chromeExtension' | 'safariExtension' | 'iosSafariExtension';
    paymentLink: string | false;
  };
  @Prop() updateCard: (
    payload: UpdateCardPayload
  ) => Promise<Result<TranslationCards>>;
  @Prop() attachTag: (
    data: AttachTagPayload
  ) => Promise<Result<TranslationCards>>;
  @Prop() detachTag: (
    data: DetachTagPayload
  ) => Promise<Result<TranslationCards>>;
  @Prop() updateTag: (
    data: UpdateTagPayload
  ) => Promise<Result<TranslationCards>>;
  @Prop() deleteTag: (
    data: DeleteTagPayload
  ) => Promise<Result<TranslationCards>>;
  @Prop({ mutable: true }) disabled = false;
  @Prop() showLanguages: boolean = true;
  @Prop() hideChatGpt: boolean = false;
  @Prop() cardsLimit: CardsLimit = 'unlimited';
  @Prop() paymentLink: string = '';
  @Prop() explanation: ComponentExplanationState = { state: 'none' };
  @Prop() explanationAnimationDelay = 0;
  @Prop() isRetrying = false;
  @Prop() isLightweight = false;
  @Prop() isLoadingExtraWords = false;

  @Event() ratingInteraction: EventEmitter<RateInteractionPayload>;

  @Event() changeSourceLanguage: EventEmitter<string>;
  @Event() changeTargetLanguage: EventEmitter<string>;
  @Event() retry: EventEmitter<void>;
  @Event() removeCard: EventEmitter<RemoveCardPayload>;
  @Event() addCard: EventEmitter<AddCardPayload>;
  @Event() watchMePaying: EventEmitter<void>;

  @Element() el: HTMLElement;

  @State() addedToday = 0;
  @State() translationCards: TranslationCard[] = [];
  @State() extraCards: TranslationCard[] = [];

  @Watch('result')
  resultChanged(result: Result<TranslationCards> | null) {
    if (result === null || result.success === false) {
      this.addedToday = 0;
      this.translationCards = [];
      this.extraCards = [];
      return;
    }

    this.addedToday = getAddedToday(result.value.deck.cards, new Date()).length;
    this.translationCards = createTranslationCards({
      collection: result.value.deck.cards,
      analysisItems: result.value.items,
      language: result.value.sourceLanguage,
    });

    if (result.value.extraItems) {
      this.extraCards = createTranslationCards({
        collection: result.value.deck.cards,
        analysisItems: result.value.extraItems,
        language: result.value.sourceLanguage,
      });
    } else {
      this.extraCards = [];
    }
  }

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.resultChanged(this.result);
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  @Method()
  async play() {
    const playSoundElement =
      this.el.shadowRoot &&
      this.el.shadowRoot.querySelector('vocably-play-sound');

    if (!playSoundElement) {
      return;
    }

    playSoundElement.play();
  }

  private askForRatingContainer: HTMLDivElement | undefined;

  render() {
    const sourceLanguageSelector = this.result && this.result.success && (
      <vocably-hint-selector
        hint={t('translation.i_study')}
        shrinkSmall={true}
        disabled={this.loading || this.disabled}
        onChoose={(event) => this.changeSourceLanguage.emit(event.detail)}
        value={this.sourceLanguage}
        optionGroups={[
          [
            '',
            Object.keys(languageList)
              .map((code) => {
                return [code, t(`nominative_${code}`)] as any;
              })
              .sort(sortLanguages(this.existingSourceLanguages)),
          ],
        ]}
      ></vocably-hint-selector>
    );

    const targetLanguageSelector = this.result && this.result.success && (
      <vocably-hint-selector
        hint={t('translation.i_speak')}
        shrinkSmall={true}
        disabled={this.loading || this.disabled}
        onChoose={(event) => this.changeTargetLanguage.emit(event.detail)}
        value={this.targetLanguage}
        optionGroups={[
          [
            '',
            Object.keys(languageList)
              .map((code) => {
                return [code, t(`nominative_${code}`)] as any;
              })
              .sort(sortLanguages(this.existingTargetLanguages)),
          ],
        ]}
      ></vocably-hint-selector>
    );

    const showChatGpt =
      !this.hideChatGpt &&
      this.result &&
      this.result.success &&
      this.result.value.aiThinksItIs;

    const canAdd =
      this.cardsLimit === 'unlimited' ||
      !this.paymentLink ||
      (this.result &&
        this.result.success &&
        this.result.value.deck.cards.length < this.cardsLimit.maxCards) ||
      (this.result &&
        this.result.success &&
        this.cardsLimit.cardsPerDay > this.addedToday);

    const isOkayToAskForRating = this.askForRating && canAdd;

    return (
      <Host data-test="translation-container">
        <div class="vocably-loading-container">
          {!this.result && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <vocably-spinner></vocably-spinner>
              <div style={{ fontSize: '13px' }}>
                {t('translation.generating')}
              </div>
            </div>
          )}
          {this.result && this.result.success === false && (
            <div
              class="padding-left-12"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>{t('translation.error')}</div>
              <div>
                <button
                  class="vocably-link-button vocably-nondecorated"
                  onClick={() => this.retry.emit()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  disabled={this.isRetrying}
                >
                  {t('translation.retry')}
                  {this.isRetrying && (
                    <vocably-inline-loader></vocably-inline-loader>
                  )}
                  <vocably-icon-reload
                    style={{
                      display: this.isRetrying ? 'none' : 'inline-block',
                    }}
                  ></vocably-icon-reload>
                </button>
              </div>
            </div>
          )}
          {this.result && this.result.success === true && (
            <Fragment>
              {this.showLanguages && (
                <div class="vocably-mb-18 vocably-language-selector">
                  <div class="vocably-language-wrapper">
                    {sourceLanguageSelector}
                  </div>
                  <vocably-icon-arrow-right class="vocably-from-to"></vocably-icon-arrow-right>
                  <div class="vocably-language-wrapper">
                    {targetLanguageSelector}
                  </div>
                </div>
              )}
              {showChatGpt && (
                <div class="padding-left-12 vocably-bottom-12-border">
                  <div class="vocably-small vocably-muted vocably-mb-4">
                    {t('translation.ai_thinks')}{' '}
                  </div>
                  <span class="vocably-emphasized">
                    {isGoogleTTSLanguage(this.result.value.sourceLanguage) && (
                      <vocably-play-sound
                        text={this.phrase}
                        language={this.result.value.sourceLanguage}
                        playAudioPronunciation={this.playAudioPronunciation}
                      />
                    )}
                    {this.phrase}
                  </span>{' '}
                  {t('translation.means')}{' '}
                  <i>{this.result.value.aiThinksItIs}</i>
                </div>
              )}
              <vocably-translation-cards
                cards={this.translationCards}
                translationCards={this.result.value}
                canAdd={!!canAdd}
                cardsLimit={this.cardsLimit}
                paymentLink={this.paymentLink}
                canCongratulate={this.canCongratulate}
                isUpdating={this.isUpdating}
                disabled={this.disabled}
                isLightweight={this.isLightweight}
                playAudioPronunciation={this.playAudioPronunciation}
                updateCard={this.updateCard}
                attachTag={this.attachTag}
                detachTag={this.detachTag}
                updateTag={this.updateTag}
                deleteTag={this.deleteTag}
                onRemoveCard={(e) => this.removeCard.emit(e.detail)}
                onAddCard={(e) => this.addCard.emit(e.detail)}
                onWatchMePaying={() => this.watchMePaying.emit()}
                onResultUpdated={(e) => {
                  this.result = e.detail;
                }}
              ></vocably-translation-cards>
              <vocably-animated-content-wrapper
                delay={this.explanationAnimationDelay}
                class="explanation-frame"
              >
                {this.explanation.state !== 'none' && (
                  <div class="vocably-pt-12">
                    <div class="panel">
                      {this.explanation.state === 'loading' && (
                        <Fragment>
                          <span
                            style={{
                              display: 'inline-block',
                              verticalAlign: 'middle',
                              fontSize: '13px',
                            }}
                          >
                            {t('translation.requesting_ai')}
                          </span>
                          <vocably-inline-loader
                            style={{ marginLeft: '8px' }}
                          ></vocably-inline-loader>
                        </Fragment>
                      )}
                      {this.explanation.state === 'error' &&
                        this.explanation.error}
                      {this.explanation.state === 'loaded' && (
                        <div
                          class="explanation"
                          innerHTML={mdConverter.makeHtml(
                            this.explanation.value
                          )}
                        ></div>
                      )}
                    </div>
                  </div>
                )}
                {this.extraCards.length > 0 && (
                  <div class="vocably-pt-12">
                    <vocably-translation-cards
                      cards={this.extraCards}
                      translationCards={this.result.value}
                      canAdd={!!canAdd}
                      cardsLimit={this.cardsLimit}
                      paymentLink={this.paymentLink}
                      canCongratulate={this.canCongratulate}
                      isUpdating={this.isUpdating}
                      disabled={this.disabled}
                      isLightweight={this.isLightweight}
                      playAudioPronunciation={this.playAudioPronunciation}
                      updateCard={this.updateCard}
                      attachTag={this.attachTag}
                      detachTag={this.detachTag}
                      updateTag={this.updateTag}
                      deleteTag={this.deleteTag}
                      onRemoveCard={(e) => this.removeCard.emit(e.detail)}
                      onAddCard={(e) => this.addCard.emit(e.detail)}
                      onWatchMePaying={() => this.watchMePaying.emit()}
                      onResultUpdated={(e) => {
                        this.result = e.detail;
                      }}
                    ></vocably-translation-cards>
                  </div>
                )}
                {this.isLoadingExtraWords && (
                  <div
                    class="vocably-pt-12"
                    style={{
                      paddingLeft: '12px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{t('translation.requests_extra_items')}</span>
                    <vocably-inline-loader></vocably-inline-loader>
                  </div>
                )}
              </vocably-animated-content-wrapper>
              {isOkayToAskForRating && (
                <div
                  class="vocably-rate-container"
                  ref={(el) => (this.askForRatingContainer = el)}
                >
                  <div style={{ paddingTop: '12px' }}>
                    <div class="panel">
                      <vocably-rate
                        platform={this.extensionPlatform}
                        onUserSelected={(choiceEvent) => {
                          switch (choiceEvent.detail) {
                            case 'review':
                            case 'feedback':
                              break;
                            case 'later':
                              this.askForRatingContainer &&
                                this.askForRatingContainer.classList.add(
                                  'vocably-rate-container-hidden'
                                );
                              break;
                            case 'never':
                              this.askForRatingContainer &&
                                this.askForRatingContainer.classList.add(
                                  'vocably-rate-container-hidden'
                                );
                              break;
                          }

                          this.ratingInteraction.emit(choiceEvent.detail);
                        }}
                      ></vocably-rate>
                    </div>
                  </div>
                </div>
              )}
              {this.loading && (
                <div class="vocably-reload" data-test="reload">
                  <vocably-spinner></vocably-spinner>
                </div>
              )}
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}
