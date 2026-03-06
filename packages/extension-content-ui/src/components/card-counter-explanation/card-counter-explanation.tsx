import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Host,
  Prop,
} from '@stencil/core';
import { subscribeToLocale, t } from '../../i18n';

@Component({
  tag: 'vocably-card-counter-explanation',
  styleUrl: 'card-counter-explanation.scss',
  shadow: true,
})
export class VocablyCardCounterExplanation {
  @Element() el: HTMLElement;
  @Prop() maxCards: number = 30;
  @Prop() paymentLink: string = '';

  @Event() closeExplanation: EventEmitter<void>;
  @Event() paymentClicked: EventEmitter<void>;

  private becameVisible: number = 0;
  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.becameVisible = new Date().getTime();
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  onClose = () => {
    if (new Date().getTime() - this.becameVisible < 100) {
      return;
    }

    this.closeExplanation.emit();
  };

  render() {
    return (
      <Host>
        <div class="explanation">
          <button
            onClick={() => this.onClose()}
            class="close-button"
            style={{ right: '8px', top: '8px' }}
            title={t('counter.close')}
          >
            <vocably-icon-close></vocably-icon-close>
          </button>
          <div style={{ marginRight: '8px' }}>
            {t('counter.limit_message', {
              plan: t('counter.free_plan'),
              count: this.maxCards,
            })}
          </div>
          <div>{t('counter.one_per_day')}</div>
          <div>
            <a
              href={this.paymentLink}
              target="_blank"
              class="upgrade-button"
              onClick={() => this.paymentClicked.emit()}
            >
              {t('counter.upgrade')}
            </a>
          </div>
        </div>
      </Host>
    );
  }
}
