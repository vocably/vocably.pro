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
import { languageList } from '@vocably/model';
import { subscribeToLocale, t } from '../../i18n';

@Component({
  tag: 'vocably-language',
  styleUrl: 'language.scss',
  shadow: true,
})
export class VocablyLanguage {
  @Element() el: HTMLElement;
  @Prop() sourceLanguage: string;
  @Prop() targetLanguage: string;
  @Prop() waiting: boolean;
  @Event() confirm: EventEmitter<{
    sourceLanguage: string;
    targetLanguage: string;
  }>;

  private sourceLanguageSelect: HTMLSelectElement;
  private targetLanguageSelect: HTMLSelectElement;

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  render() {
    return (
      <Host data-test="language">
        <div class="container">
          <div class="h1 p">{t('language.i_study')}</div>
          <div class="p">
            <select
              data-test="source-language-selector"
              ref={(el) =>
                (this.sourceLanguageSelect = el as HTMLSelectElement)
              }
            >
              {Object.keys(languageList)
                .map((code) => [code, t(`nominative_${code}`)])
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([code, label]) => (
                  <option selected={this.sourceLanguage === code} value={code}>
                    {label}
                  </option>
                ))}
            </select>
          </div>
          <div class="h1 p">{t('language.i_speak')}</div>
          <div class="p">
            <select
              data-test="target-language-selector"
              ref={(el) =>
                (this.targetLanguageSelect = el as HTMLSelectElement)
              }
            >
              {Object.keys(languageList)
                .map((code) => [code, t(`nominative_${code}`)])
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([code, label]) => (
                  <option selected={this.targetLanguage === code} value={code}>
                    {label}
                  </option>
                ))}
            </select>
          </div>
          <div class="button-container">
            <button
              class="button"
              onClick={() =>
                this.confirm.emit({
                  sourceLanguage: this.sourceLanguageSelect.value,
                  targetLanguage: this.targetLanguageSelect.value,
                })
              }
              data-test="subscribe-button"
              disabled={this.waiting}
            >
              {this.waiting ? t('language.saving') : t('language.save')}
            </button>
          </div>
        </div>
      </Host>
    );
  }
}
