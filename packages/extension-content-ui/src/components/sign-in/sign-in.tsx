import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Host,
} from '@stencil/core';
import { subscribeToLocale, t } from '../../i18n';

@Component({
  tag: 'vocably-sign-in',
  styleUrl: 'sign-in.scss',
  shadow: true,
})
export class VocablySignIn {
  @Element() el: HTMLElement;
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
      <Host data-test="sign-in">
        <div class="p">{t('sign_in.please')}</div>
        <div class="p">
          <button
            class="button"
            data-test="sign-in-button"
            onClick={() => this.confirm.emit()}
          >
            {t('sign_in.button')}
          </button>
        </div>
        <div>
          {t('sign_in.agree')}{' '}
          <a
            class="link"
            href="https://vocably.pro/terms-and-conditions.html"
            target="_blank"
          >
            {t('sign_in.terms')}
          </a>{' '}
          {t('sign_in.and')}{' '}
          <a
            class="link"
            href="https://vocably.pro/privacy-policy.html"
            target="_blank"
          >
            {t('sign_in.privacy')}
          </a>
          .
        </div>
      </Host>
    );
  }
}
