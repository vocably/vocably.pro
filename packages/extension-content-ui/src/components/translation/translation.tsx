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
} from '@stencil/core';
import { isItem } from '@vocably/crud';
import {
  AddCardPayload,
  AttachTagPayload,
  AudioPronunciationPayload,
  Card,
  CardItem,
  CardsLimit,
  DeleteTagPayload,
  DetachTagPayload,
  GoogleLanguage,
  isCardItem,
  isDetachedCardItem,
  isGoogleTTSLanguage,
  languageList,
  RateInteractionPayload,
  RemoveCardPayload,
  Result,
  TagCandidate,
  TagItem,
  TranslationCard,
  TranslationCards,
  UpdateCardPayload,
  UpdateTagPayload,
} from '@vocably/model';
import showdown from 'showdown';
import { subscribeToLocale, t } from '../../i18n';
import { getSelectedTagIds } from './getSelectedTagIds';
import { sortLanguages } from './sortLanguages';

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

  @Event() ratingInteraction: EventEmitter<RateInteractionPayload>;

  @Event() changeSourceLanguage: EventEmitter<string>;
  @Event() changeTargetLanguage: EventEmitter<string>;
  @Event() retry: EventEmitter<void>;
  @Event() removeCard: EventEmitter<RemoveCardPayload>;
  @Event() addCard: EventEmitter<AddCardPayload>;
  @Event() watchMePaying: EventEmitter<void>;

  @State() saveCardClicked = false;
  @State() addedItemIndex = -1;
  @State() congratulateItemIndex = -1;
  @State() addAttemptIndex = -1;
  @State() removing: {
    card: CardItem;
    tag: TagItem;
  } | null = null;

  @Element() el: HTMLElement;

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
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

  private overlay: HTMLElement | null = null;
  private tagsMenu: HTMLElement | null = null;

  private makeUpdateCard =
    (card: TranslationCard) =>
    async (data: Partial<Card>): Promise<Result<TranslationCards>> => {
      if (!this.result) {
        return {
          success: false,
          reason: 'Result is not set',
        };
      }

      if (this.result.success === false) {
        return this.result;
      }

      const result = await this.updateCard({
        card,
        data,
        translationCards: this.result.value,
      });

      if (result.success === true) {
        this.result = result;
      }

      return result;
    };

  private showTagMenu(caller: HTMLElement, cardId: string) {
    if (this.result === null || !this.result.success) {
      return;
    }

    if (this.overlay) {
      this.overlay.remove();
    }

    if (this.tagsMenu) {
      this.tagsMenu.remove();
    }

    const tagsMenu = document.createElement('vocably-tags-menu');
    tagsMenu.existingItems = this.result.value.tags;
    tagsMenu.selectedItems = getSelectedTagIds(this.result.value, cardId);

    const callerPosition = caller.getBoundingClientRect();
    tagsMenu.style.position = 'absolute';
    tagsMenu.style.left = `${window.scrollX + callerPosition.right}px`;
    tagsMenu.style.transform = `translate(-100%, 0)`;

    tagsMenu.saveTag = async (tag: TagCandidate): Promise<Result<any>> => {
      if (!this.result || !this.result.success) {
        return {
          success: false,
          errorCode: 'EXTENSION_UNABLE_TO_COMPLETE_TAG_OPERATION',
          reason:
            'Unable to save tag because the result is empty or erroneous.',
        };
      }

      this.disabled = true;

      const result = await (isItem(tag)
        ? this.updateTag({
            tag,
            translationCards: this.result.value,
          })
        : this.attachTag({
            cardId,
            tag,
            translationCards: this.result.value,
          }));

      this.disabled = false;

      if (result.success) {
        this.result = result;
        tagsMenu.existingItems = result.value.tags;
        tagsMenu.selectedItems = getSelectedTagIds(result.value, cardId);
      }

      return result;
    };

    tagsMenu.deleteTag = async (tag: TagItem): Promise<Result<unknown>> => {
      if (!this.result || !this.result.success) {
        return {
          success: false,
          errorCode: 'EXTENSION_UNABLE_TO_COMPLETE_TAG_OPERATION',
          reason:
            'Unable to delete tag because the result is empty or erroneous.',
        };
      }

      this.disabled = true;

      const result = await this.deleteTag({
        tag,
        translationCards: this.result.value,
      });

      this.disabled = false;

      if (result.success) {
        this.result = result;
        tagsMenu.existingItems = result.value.tags;
        tagsMenu.selectedItems = getSelectedTagIds(result.value, cardId);
      }

      return result;
    };

    tagsMenu.attachTag = async (tag: TagItem): Promise<Result<unknown>> => {
      if (!this.result || !this.result.success) {
        return {
          success: false,
          errorCode: 'EXTENSION_UNABLE_TO_COMPLETE_TAG_OPERATION',
          reason:
            'Unable to attach tag because the result is empty or erroneous.',
        };
      }

      this.disabled = true;

      const result = await this.attachTag({
        translationCards: this.result.value,
        tag,
        cardId,
      });

      this.disabled = false;

      if (result.success) {
        this.result = result;
        tagsMenu.existingItems = result.value.tags;
        tagsMenu.selectedItems = getSelectedTagIds(result.value, cardId);
      }

      return result;
    };

    tagsMenu.detachTag = async (tag: TagItem): Promise<Result<unknown>> => {
      if (!this.result || !this.result.success) {
        return {
          success: false,
          errorCode: 'EXTENSION_UNABLE_TO_COMPLETE_TAG_OPERATION',
          reason:
            'Unable to detach tag because the result is empty or erroneous.',
        };
      }

      this.disabled = true;

      const result = await this.detachTag({
        translationCards: this.result.value,
        tag,
        cardId,
      });

      this.disabled = false;

      if (result.success) {
        this.result = result;
        tagsMenu.existingItems = result.value.tags;
        tagsMenu.selectedItems = getSelectedTagIds(result.value, cardId);
      }

      return result;
    };

    if (callerPosition.top * 2 > window.innerHeight) {
      tagsMenu.style.bottom = `${
        window.innerHeight - window.scrollY - callerPosition.bottom
      }px`;
    } else {
      tagsMenu.style.top = `${window.scrollY + callerPosition.top}px`;
    }

    const overlay = document.createElement('vocably-overlay');
    overlay.style.setProperty('--backdropOpacity', '0');
    overlay.appendChild(tagsMenu);
    window.document.body.appendChild(overlay);

    this.overlay = overlay;
    this.tagsMenu = tagsMenu;
  }

  private detachTagClick = (card: CardItem, tag: TagItem) => async () => {
    if (!this.result || !this.result.success) {
      return false;
    }

    if (!this.deleteTag) {
      return false;
    }

    if (this.disabled) {
      return false;
    }

    this.disabled = true;
    this.removing = {
      card,
      tag,
    };

    const result = await this.detachTag({
      translationCards: this.result.value,
      cardId: card.id,
      tag: tag,
    });

    this.disabled = false;
    this.removing = null;

    if (result.success) {
      this.result = result;
    }
  };

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
        this.result.value.collectionLength < this.cardsLimit.maxCards) ||
      (this.result &&
        this.result.success &&
        this.cardsLimit.cardsPerDay > this.result.value.addedToday);

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
              {this.result.value.cards.map((card, itemIndex, cardsArray) => (
                <Fragment>
                  {!canAdd && this.cardsLimit !== 'unlimited' && (
                    <div
                      class={{
                        'max-limit-1': true,
                        'max-limit-visible': this.addAttemptIndex === itemIndex,
                      }}
                    >
                      <div class="max-limit-2">
                        <div class="panel max-limit-3">
                          <div>
                            {t('translation.free_plan_limit', {
                              plan: t('translation.free_plan'),
                              count: this.cardsLimit.maxCards,
                            })}
                          </div>
                          <div>
                            {t('translation.per_day', {
                              count: this.cardsLimit.cardsPerDay,
                            })}
                          </div>
                          <a
                            href={this.paymentLink}
                            target="_blank"
                            class="upgrade-button"
                            onClick={() => {
                              this.watchMePaying.emit();
                            }}
                          >
                            {t('translation.upgrade')}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    data-test="card"
                    class={{
                      'vocably-card padding-left-12': true,
                      'vocably-bottom-12-border':
                        itemIndex < cardsArray.length - 1,
                    }}
                  >
                    {this.canCongratulate && (
                      <div
                        class={
                          'vocably-added-congratulation' +
                          (this.congratulateItemIndex === itemIndex
                            ? ' vocably-added-congratulation-visible'
                            : '')
                        }
                      >
                        <div class="vocably-pb-12">
                          <vocably-first-translation-congratulation
                            card={card}
                          ></vocably-first-translation-congratulation>
                        </div>
                      </div>
                    )}
                    <div class="vocably-card-container">
                      <div class="vocably-card-action">
                        {isCardItem(card) && (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              alignItems: 'flex-end',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px',
                              }}
                            >
                              <button
                                class="vocably-card-action-button"
                                title={t('translation.remove_card')}
                                disabled={this.isUpdating !== null}
                                onClick={() => {
                                  if (this.disabled) {
                                    return false;
                                  }

                                  this.saveCardClicked = true;
                                  if (
                                    this.congratulateItemIndex === itemIndex
                                  ) {
                                    this.congratulateItemIndex = -1;
                                  }
                                  this.addedItemIndex = -1;
                                  this.result &&
                                    this.result.success === true &&
                                    this.removeCard.emit({
                                      translationCards: this.result.value,
                                      card,
                                    });
                                }}
                              >
                                {this.isUpdating === card && (
                                  <vocably-icon-spin></vocably-icon-spin>
                                )}
                                {this.isUpdating !== card && (
                                  <vocably-icon-bookmark-check></vocably-icon-bookmark-check>
                                )}
                              </button>
                            </div>

                            <button
                              class="vocably-card-action-button"
                              title={t('translation.edit_tags')}
                              disabled={this.isUpdating !== null}
                              onClick={(e) => {
                                if (this.disabled) {
                                  return;
                                }

                                e.target &&
                                  this.showTagMenu(
                                    e.target as HTMLElement,
                                    card.id
                                  );
                              }}
                            >
                              {this.isUpdating !== card && (
                                <vocably-icon-tag></vocably-icon-tag>
                              )}
                            </button>
                          </div>
                        )}
                        {!this.isLightweight && isDetachedCardItem(card) && (
                          <button
                            class={{
                              'vocably-card-action-button': true,
                              'vocably-card-add-button': true,
                            }}
                            title="Add card"
                            disabled={this.isUpdating !== null}
                            onClick={() => {
                              if (this.disabled) {
                                return false;
                              }

                              if (!canAdd) {
                                this.addAttemptIndex = itemIndex;
                                return;
                              } else {
                                this.addAttemptIndex = -1;
                              }

                              this.saveCardClicked = true;
                              if (this.congratulateItemIndex === -1) {
                                this.congratulateItemIndex = itemIndex;
                              }

                              this.addedItemIndex = itemIndex;

                              this.result &&
                                this.result.success === true &&
                                this.addCard.emit({
                                  translationCards: this.result.value,
                                  card,
                                });
                            }}
                          >
                            {this.isUpdating === card && (
                              <vocably-icon-spin></vocably-icon-spin>
                            )}
                            {this.isUpdating !== card && (
                              <vocably-icon-plus></vocably-icon-plus>
                            )}
                            <span
                              style={{
                                marginLeft: '2px',
                                display: 'inline-block',
                                fontSize: '16px',
                              }}
                            >
                              {t('translation.learn')}
                            </span>
                          </button>
                        )}
                      </div>
                      <div class="vocably-safe-action-area">
                        <vocably-card-source
                          card={card}
                          playAudioPronunciation={this.playAudioPronunciation}
                          style={{
                            marginBottom: '6px',
                          }}
                          class="vocably-card-source"
                        ></vocably-card-source>
                        <vocably-card-definitions
                          class="vocably-mb-6"
                          card={card}
                          updateCard={this.makeUpdateCard(card)}
                          isLightweight={this.isLightweight}
                        ></vocably-card-definitions>
                        {card.data.example && (
                          <div>
                            <div class="vocably-small vocably-mb-6">
                              {t('translation.example')}
                            </div>
                            <vocably-card-examples
                              example={card.data.example}
                            ></vocably-card-examples>
                          </div>
                        )}
                        {isItem(card) && card.data.tags.length > 0 && (
                          <div
                            class="vocably-mt-12"
                            style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}
                          >
                            {card.data.tags.map((tagItem) => (
                              <div class="vocably-tag">
                                {tagItem.data.title}

                                <button
                                  type="button"
                                  class="vocably-tag-remove-button"
                                  aria-label={t('translation.remove_tag')}
                                  title={t('translation.remove_tag')}
                                  onClick={this.detachTagClick(card, tagItem)}
                                >
                                  {this.removing &&
                                    this.removing.card === card &&
                                    this.removing.tag === tagItem && (
                                      <vocably-icon-spin></vocably-icon-spin>
                                    )}
                                  {(!this.removing ||
                                    this.removing.card !== card ||
                                    this.removing.tag !== tagItem) && (
                                    <vocably-icon-remove class="vocably-tag-remove-button-icon"></vocably-icon-remove>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Fragment>
              ))}
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
