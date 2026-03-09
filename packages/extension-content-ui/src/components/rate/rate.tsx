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
  tag: 'vocably-rate',
  styleUrl: 'rate.scss',
  shadow: false,
})
export class VocablyRate {
  @Element() el: HTMLElement;
  @Event() userSelected: EventEmitter<
    'review' | 'later' | 'never' | 'feedback'
  >;

  @Prop() platform: { name: string; url: string };

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  render() {
    return (
      <Host>
        <div>
          <strong>{t('rate.tagline')}</strong>
        </div>
        <div class="vocably-mt-12">
          {t('rate.question', { platform: this.platform.name })}
          <br />
          {t('rate.question2')}
        </div>
        <div class="vocably-mt-12">
          <a
            href={this.platform.url}
            target="_blank"
            class="vocably-button"
            onClick={() => this.userSelected.emit('review')}
          >
            {t('rate.ok')}
          </a>
          <button
            style={{ marginLeft: '8px' }}
            class="vocably-link-button"
            onClick={() => this.userSelected.emit('later')}
          >
            {t('rate.later')}
          </button>
        </div>
        <div class="vocably-mt-12">
          {t('rate.dislike')}{' '}
          <a
            href="https://app.vocably.pro/feedback"
            target="_blank"
            class="vocably-link-button"
            onClick={() => this.userSelected.emit('feedback')}
          >
            {t('rate.contact')}
          </a>
          {t('rate.feedback_note')}
        </div>
        <div class="vocably-mt-12">
          {t('rate.show_again')}
          <button
            class="vocably-link-button vocably-text-link vocably-small"
            onClick={() => this.userSelected.emit('never')}
          >
            {t('rate.never')}
          </button>
        </div>
      </Host>
    );
  }
}
