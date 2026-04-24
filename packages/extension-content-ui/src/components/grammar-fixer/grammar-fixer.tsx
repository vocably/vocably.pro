import {
  Component,
  Element,
  EventEmitter,
  forceUpdate,
  h,
  Host,
  Prop,
  Event,
  Fragment,
} from '@stencil/core';
import {
  FixGrammarPayload,
  FixGrammarResponse,
  isGoogleLanguage,
  languageList,
  Result,
} from '@vocably/model';
import showdown from 'showdown';
import { subscribeToLocale } from '../../i18n';

const mdConverter = new showdown.Converter();

@Component({
  tag: 'vocably-grammar-fixer',
  styleUrl: 'grammar-fixer.scss',
  shadow: true,
})
export class VocablyFixGrammar {
  @Element() el: HTMLElement;

  @Prop() values: FixGrammarPayload = {
    text: '',
    language: 'en',
  };
  @Prop() isLoading: boolean = false;
  @Prop() result: Result<FixGrammarResponse> | null = null;

  @Event() valuesChange: EventEmitter<FixGrammarPayload>;
  @Event() formSubmit: EventEmitter<FixGrammarPayload>;

  private textElement: HTMLTextAreaElement;
  private resultElement: HTMLDivElement;
  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    this.formSubmit.emit(this.values);
  }

  private languageOptions() {
    return Object.entries(languageList)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  render() {
    const canSubmit = this.values.text.trim() !== '';
    const languages = this.languageOptions();

    return (
      <Host>
        <form class="form" onSubmit={(e) => this.handleSubmit(e)}>
          <div class="fields-row">
            <div class="field">
              <label class="label" htmlFor="fix-grammar-language">
                Language
              </label>
              <select
                id="fix-grammar-language"
                class="select"
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  if (!isGoogleLanguage(val)) {
                    return;
                  }
                  this.valuesChange.emit({
                    ...this.values,
                    language: val,
                  });
                }}
              >
                {languages.map(({ code, name }) => (
                  <option value={code} selected={this.values.language === code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div class="field">
              <label class="label" htmlFor="fix-grammar-explanation-language">
                Explanation language
              </label>
              <select
                id="fix-grammar-explanation-language"
                class="select"
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  if (!isGoogleLanguage(val)) {
                    return;
                  }

                  this.valuesChange.emit({
                    ...this.values,
                    explanationLanguage: val,
                  });
                }}
              >
                {languages.map(({ code, name }) => (
                  <option
                    value={code}
                    selected={this.values.explanationLanguage === code}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div class="field">
            <div class="label-with-actions">
              <label class="label" htmlFor="fix-grammar-text">
                Sentence to check
              </label>
              <div class="actions">
                <button
                  class="clear-button"
                  disabled={!this.values.text.trim()}
                  type="button"
                  onClick={() => {
                    this.valuesChange.emit({
                      ...this.values,
                      text: '',
                    });
                    this.textElement.focus();
                  }}
                >
                  <vocably-icon-remove></vocably-icon-remove>
                  <span>Clear</span>
                </button>
              </div>
            </div>
            <div class="actions-input">
              <textarea
                placeholder="Enter any text here"
                id="fix-grammar-text"
                class="input textarea"
                required
                ref={(el) => (this.textElement = el as HTMLTextAreaElement)}
                value={this.values.text}
                onInput={(e) => {
                  this.valuesChange.emit({
                    ...this.values,
                    text: (e.target as HTMLTextAreaElement).value,
                  });
                }}
              />
              <div class="actions">
                <button class="button" type="submit" disabled={!canSubmit}>
                  <vocably-icon-send></vocably-icon-send>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div ref={(el) => (this.resultElement = el as HTMLDivElement)}>
          {this.isLoading && (
            <div class="result result--loading">
              <vocably-skeleton-loader-bone
                class="skeleton-loader-title"
                style={{
                  width: '100%',
                  height: '32px',
                  marginBottom: '8px',
                }}
              ></vocably-skeleton-loader-bone>
              <vocably-skeleton-loader-bone
                class="skeleton-loader-text"
                style={{
                  width: '85%',
                }}
              ></vocably-skeleton-loader-bone>
              <vocably-skeleton-loader-bone
                class="skeleton-loader-text"
                style={{
                  width: '83%',
                }}
              ></vocably-skeleton-loader-bone>
              <vocably-skeleton-loader-bone
                class="skeleton-loader-text"
                style={{
                  width: '87%',
                }}
              ></vocably-skeleton-loader-bone>
            </div>
          )}
          {!this.isLoading && this.result && (
            <Fragment>
              {this.result.success === false && (
                <div class="result result--error">{this.result.reason}</div>
              )}

              {this.result.success === true && (
                <div class="result">
                  {this.result.value.isCorrect ? (
                    <div class="correct-badge">
                      <vocably-icon-check class="correct-icon" />
                      No grammar issues found
                    </div>
                  ) : (
                    <div class="corrected-text">
                      <div class="corrected-text__label">Corrected text</div>
                      <div class="corrected-text__copy">
                        <vocably-button-copy
                          onCopy={() => {
                            if (this.result?.success === true) {
                              navigator.clipboard.writeText(
                                this.result.value.text
                              );
                            }
                          }}
                        ></vocably-button-copy>
                      </div>
                      <div class="corrected-text__value">
                        {this.result.value.text}
                      </div>
                    </div>
                  )}
                  <div
                    class="explanation"
                    innerHTML={mdConverter.makeHtml(
                      this.result.value.explanation
                    )}
                  />
                </div>
              )}
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}
