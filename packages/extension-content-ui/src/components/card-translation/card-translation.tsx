import { Component, h, Prop, State } from '@stencil/core';
import {
  Card,
  Result,
  TranslationCard,
  TranslationCards,
} from '@vocably/model';

@Component({
  tag: 'vocably-card-translation',
  styleUrl: 'card-translation.scss',
  shadow: false,
})
export class VocablyCardTranslation {
  // @ts-ignore
  private translationInput: HTMLInputElement | undefined;

  @Prop() card: TranslationCard;
  @Prop() updateCard: (
    data: Partial<Card>
  ) => Promise<Result<TranslationCards>>;
  @Prop() disableEditing: boolean = false;

  @State() isEdit = false;
  @State() isSaving = false;

  onSubmit = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.isSaving) {
      return;
    }

    if (!this.translationInput) {
      throw new Error('Translation input does not exist.');
    }

    if (this.translationInput.value.trim() === '') {
      return;
    }

    this.isSaving = true;

    const updateResult = await this.updateCard({
      translation: this.translationInput.value.trim(),
    });

    if (updateResult.success === true) {
      this.isEdit = false;
    } else {
      alert('Unable to update the card.');
    }

    this.isSaving = false;

    return;
  };

  render() {
    if (this.card === undefined) {
      return <div>Card is undefined</div>;
    }

    if (this.disableEditing) {
      return <div class="vocably-italic">{this.card.data.translation}</div>;
    }

    if (!this.isEdit) {
      return (
        <div
          class="vocably-italic hover-button"
          onClick={() => {
            if (!this.isSaving) {
              this.isEdit = true;
            }
          }}
        >
          {this.card.data.translation}&nbsp;{''}
          <button class="translation-icon-button">
            <vocably-icon-edit></vocably-icon-edit>
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={this.onSubmit}>
        <input
          type="text"
          class="text-input"
          value={this.card.data.translation}
          autofocus={true}
          readonly={this.isSaving}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape' && !this.isSaving) {
              this.isEdit = false;
            }
          }}
          onKeyPress={(e) => e.stopPropagation()}
          ref={(el) => {
            this.translationInput = el;
            if (this.translationInput) {
              setTimeout(() => {
                this.translationInput && this.translationInput.focus();
              }, 200);
            }
          }}
        />
        {this.isSaving && (
          <vocably-icon-spin class="spin-icon"></vocably-icon-spin>
        )}
        {!this.isSaving && (
          <button
            class="translation-icon-button"
            type="submit"
            disabled={this.isSaving}
          >
            <vocably-icon-check></vocably-icon-check>
          </button>
        )}
        {!this.isSaving && (
          <button
            class="translation-icon-button"
            type="reset"
            onClick={() => (this.isEdit = false)}
          >
            <vocably-icon-close></vocably-icon-close>
          </button>
        )}
      </form>
    );
  }
}
