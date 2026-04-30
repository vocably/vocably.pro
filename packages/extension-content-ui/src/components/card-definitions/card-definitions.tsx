import { Component, h, Prop } from '@stencil/core';
import {
  Card,
  Result,
  TranslationCard,
  TranslationCards,
} from '@vocably/model';
import { explode } from '@vocably/sulna';

@Component({
  tag: 'vocably-card-definitions',
  styleUrl: 'card-definitions.scss',
  shadow: false,
})
export class VocablyCardDefinitions {
  @Prop() card: TranslationCard;
  @Prop() updateCard: (
    data: Partial<Card>
  ) => Promise<Result<TranslationCards>>;
  @Prop() isLightweight: boolean = false;

  private renderTranslation() {
    return (
      <vocably-card-translation
        card={this.card}
        updateCard={this.updateCard}
        disableEditing={this.isLightweight}
      ></vocably-card-translation>
    );
  }

  render() {
    if (this.card === undefined) {
      return <div>Card is undefined</div>;
    }

    const definitions = explode(this.card.data.definition);

    if (definitions.length === 0) {
      return this.renderTranslation();
    }

    return (
      <ul class="vocably-list">
        {this.card.data.translation && <li>{this.renderTranslation()}</li>}
        {definitions.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
    );
  }
}
