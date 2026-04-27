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
          <label htmlFor="fix-grammar-text" class="block input-block">
            <div class="label">
              <vocably-tiny-select
                class="language"
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  if (!isGoogleLanguage(val)) {
                    return;
                  }

                  const values = {
                    ...this.values,
                    language: val,
                  };
                  this.valuesChange.emit({
                    ...this.values,
                    language: val,
                  });

                  if (canSubmit) {
                    this.formSubmit.emit(values);
                  }
                }}
              >
                {languages.map(({ code, name }) => (
                  <option value={code} selected={this.values.language === code}>
                    {name}
                  </option>
                ))}
              </vocably-tiny-select>
            </div>
            <div class="label-action">
              <button
                class="clear-button"
                title="Clear text"
                disabled={!this.values.text.trim()}
                type="button"
                onClick={() => {
                  this.valuesChange.emit({
                    ...this.values,
                    text: '',
                  });
                  this.textElement.focus();
                  this.result = null;
                }}
              >
                <vocably-icon-backspace></vocably-icon-backspace>
              </button>
            </div>
            <div class="body">
              <textarea
                placeholder="Enter any text here"
                id="fix-grammar-text"
                class="block-textarea"
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
            </div>
            <div class="body-actions">
              <button
                class="submit-button"
                title="Check grammar"
                type="submit"
                disabled={!canSubmit}
              >
                <vocably-icon-send></vocably-icon-send>
              </button>
            </div>
          </label>

          {this.isLoading && (
            <div class="loader">
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
            <div class="result">
              {this.result.success === false && (
                <div class="error">{this.result.reason}</div>
              )}

              {this.result.success === true && (
                <Fragment>
                  {this.result.value.isCorrect && (
                    <div class="correct-message">
                      <vocably-icon-check class="correct-icon" />
                      No grammar issues found
                    </div>
                  )}

                  {!this.result.value.isCorrect && (
                    <div class="block">
                      <div class="label">Corrected text</div>
                      <div class="label-action"></div>
                      <div class="body">{this.result.value.text}</div>
                      <div class="body-actions">
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
                    </div>
                  )}

                  <div class="explanation">
                    <div class="explanation-language">
                      <vocably-tiny-select
                        onChange={(e) => {
                          const val = (e.target as HTMLSelectElement).value;
                          if (!isGoogleLanguage(val)) {
                            return;
                          }

                          const values = {
                            ...this.values,
                            explanationLanguage: val,
                          };

                          this.valuesChange.emit(values);

                          if (canSubmit) {
                            this.formSubmit.emit(values);
                          }
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
                      </vocably-tiny-select>
                    </div>

                    <div
                      class="explanation-text"
                      innerHTML={mdConverter.makeHtml(
                        this.result.value.explanation
                      )}
                    />
                  </div>
                </Fragment>
              )}
            </div>
          )}
        </form>
      </Host>
    );
  }
}
