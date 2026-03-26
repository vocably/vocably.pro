import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Host,
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
  isCardItem,
  isDetachedCardItem,
  RemoveCardPayload,
  Result,
  TagCandidate,
  TagItem,
  TranslationCard,
  TranslationCards,
  UpdateCardPayload,
  UpdateTagPayload,
} from '@vocably/model';
import { subscribeToLocale, t } from '../../i18n';
import { getSelectedTagIds } from '../translation/getSelectedTagIds';

@Component({
  tag: 'vocably-translation-cards',
  styleUrl: 'translation-cards.scss',
  shadow: false,
})
export class VocablyTranslationCards {
  @Prop() cards: TranslationCard[];
  @Prop() translationCards: TranslationCards;
  @Prop() canAdd: boolean = true;
  @Prop() cardsLimit: CardsLimit = 'unlimited';
  @Prop() paymentLink: string = '';
  @Prop() canCongratulate: boolean = false;
  @Prop() isUpdating: TranslationCard | null = null;
  @Prop({ mutable: true }) disabled = false;
  @Prop() isLightweight = false;
  @Prop() playAudioPronunciation: (
    payload: AudioPronunciationPayload
  ) => Promise<Result<true>>;
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

  @Event() removeCard: EventEmitter<RemoveCardPayload>;
  @Event() addCard: EventEmitter<AddCardPayload>;
  @Event() watchMePaying: EventEmitter<void>;
  @Event() resultUpdated: EventEmitter<Result<TranslationCards>>;

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

  private overlay: HTMLElement | null = null;
  private tagsMenu: HTMLElement | null = null;

  private makeUpdateCard =
    (card: TranslationCard) =>
    async (data: Partial<Card>): Promise<Result<TranslationCards>> => {
      const result = await this.updateCard({
        card,
        data,
        translationCards: this.translationCards,
      });

      if (result.success === true) {
        this.resultUpdated.emit(result);
      }

      return result;
    };

  private showTagMenu(caller: HTMLElement, cardId: string) {
    if (this.overlay) {
      this.overlay.remove();
    }

    if (this.tagsMenu) {
      this.tagsMenu.remove();
    }

    const tagsMenu = document.createElement('vocably-tags-menu');
    tagsMenu.existingItems = this.translationCards.deck.tags;
    tagsMenu.selectedItems = getSelectedTagIds(this.cards, cardId);

    const callerPosition = caller.getBoundingClientRect();
    tagsMenu.style.position = 'absolute';
    tagsMenu.style.left = `${window.scrollX + callerPosition.right}px`;
    tagsMenu.style.transform = `translate(-100%, 0)`;

    tagsMenu.saveTag = async (tag: TagCandidate): Promise<Result<any>> => {
      this.disabled = true;

      const result = await (isItem(tag)
        ? this.updateTag({
            tag,
            translationCards: this.translationCards,
          })
        : this.attachTag({
            cardId,
            tag,
            translationCards: this.translationCards,
          }));

      this.disabled = false;

      if (result.success) {
        this.resultUpdated.emit(result);
        tagsMenu.existingItems = result.value.deck.tags;
        tagsMenu.selectedItems = getSelectedTagIds(this.cards, cardId);
      }

      return result;
    };

    tagsMenu.deleteTag = async (tag: TagItem): Promise<Result<unknown>> => {
      this.disabled = true;

      const result = await this.deleteTag({
        tag,
        translationCards: this.translationCards,
      });

      this.disabled = false;

      if (result.success) {
        this.resultUpdated.emit(result);
        tagsMenu.existingItems = result.value.deck.tags;
        tagsMenu.selectedItems = getSelectedTagIds(this.cards, cardId);
      }

      return result;
    };

    tagsMenu.attachTag = async (tag: TagItem): Promise<Result<unknown>> => {
      this.disabled = true;

      const result = await this.attachTag({
        translationCards: this.translationCards,
        tag,
        cardId,
      });

      this.disabled = false;

      if (result.success) {
        this.resultUpdated.emit(result);
        tagsMenu.existingItems = result.value.deck.tags;
        tagsMenu.selectedItems = getSelectedTagIds(this.cards, cardId);
      }

      return result;
    };

    tagsMenu.detachTag = async (tag: TagItem): Promise<Result<unknown>> => {
      this.disabled = true;

      const result = await this.detachTag({
        translationCards: this.translationCards,
        tag,
        cardId,
      });

      this.disabled = false;

      if (result.success) {
        this.resultUpdated.emit(result);
        tagsMenu.existingItems = result.value.deck.tags;
        tagsMenu.selectedItems = getSelectedTagIds(this.cards, cardId);
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
      translationCards: this.translationCards,
      cardId: card.id,
      tag: tag,
    });

    this.disabled = false;
    this.removing = null;

    if (result.success) {
      this.resultUpdated.emit(result);
    }
  };

  render() {
    console.log('Congratulations', this.congratulateItemIndex);

    return (
      <Host>
        {this.cards.map((card, itemIndex, cardsArray) => (
          <div key={itemIndex}>
            {!this.canAdd && this.cardsLimit !== 'unlimited' && (
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
                'vocably-bottom-12-border': itemIndex < cardsArray.length - 1,
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
                            if (this.congratulateItemIndex === itemIndex) {
                              this.congratulateItemIndex = -1;
                            }
                            this.addedItemIndex = -1;
                            this.removeCard.emit({
                              translationCards: this.translationCards,
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
                            this.showTagMenu(e.target as HTMLElement, card.id);
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

                        if (!this.canAdd) {
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

                        this.addCard.emit({
                          translationCards: this.translationCards,
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
          </div>
        ))}
      </Host>
    );
  }
}
