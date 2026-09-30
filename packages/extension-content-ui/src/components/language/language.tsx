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
  @Prop() sourceLanguage: string = 'en';
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

  private renderOptions(selected: string) {
    return Object.keys(languageList)
      .map((code) => [code, t(`nominative_${code}`)])
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([code, label]) => (
        <option selected={selected === code} value={code}>
          {label}
        </option>
      ));
  }

  render() {
    return (
      <Host data-test="language">
        <form
          class="container"
          onSubmit={(event) => {
            event.preventDefault();
            this.confirm.emit({
              sourceLanguage: this.sourceLanguageSelect.value,
              targetLanguage: this.targetLanguageSelect.value,
            });
          }}
        >
          <div class="header">
            <div class="title">{t('language.title')}</div>
            <div class="hint">{t('language.hint')}</div>
          </div>
          <div class="fields">
            <label class="field">
              <span class="label">{t('language.i_study')}</span>
              <select
                data-test="source-language-selector"
                disabled={this.waiting}
                ref={(el) =>
                  (this.sourceLanguageSelect = el as HTMLSelectElement)
                }
              >
                {this.renderOptions(this.sourceLanguage)}
              </select>
            </label>
            <label class="field">
              <span class="label">{t('language.i_speak')}</span>
              <select
                data-test="target-language-selector"
                disabled={this.waiting}
                ref={(el) =>
                  (this.targetLanguageSelect = el as HTMLSelectElement)
                }
              >
                {this.renderOptions(this.targetLanguage)}
              </select>
            </label>
          </div>
          <button
            type="submit"
            class="button"
            data-test="subscribe-button"
            disabled={this.waiting}
          >
            {this.waiting ? t('language.saving') : t('language.save')}
          </button>
        </form>
      </Host>
    );
  }
}
