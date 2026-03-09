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
  tag: 'vocably-subscribe',
  styleUrl: 'subscribe.scss',
  shadow: true,
})
export class VocablySubscribe {
  @Element() el: HTMLElement;
  @Prop() trial: boolean = false;
  @Event() confirm: EventEmitter;

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  render() {
    return (
      <Host data-test="subscribe">
        <div class="container">
          <div class="message">
            {this.trial ? t('subscribe.trial_message') : t('subscribe.message')}
          </div>
          <div class="button-container">
            <button
              class="button"
              onClick={() => this.confirm.emit()}
              data-test="subscribe-button"
            >
              {this.trial ? t('subscribe.trial_button') : t('subscribe.button')}
            </button>
          </div>
        </div>
      </Host>
    );
  }
}
