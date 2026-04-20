import {
  Component,
  Element,
  forceUpdate,
  h,
  Host,
  Prop,
  State,
} from '@stencil/core';
import {
  FixGrammarPayload,
  FixGrammarResponse,
  GoogleLanguage,
  isGoogleLanguage,
  languageList,
  Result,
} from '@vocably/model';
import showdown from 'showdown';
import { subscribeToLocale } from '../../i18n';

const mdConverter = new showdown.Converter();

type FixGrammarState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: FixGrammarResponse }
  | { status: 'error'; message: string };

@Component({
  tag: 'vocably-grammar-fixer',
  styleUrl: 'grammar-fixer.scss',
  shadow: true,
})
export class VocablyFixGrammar {
  @Element() el: HTMLElement;

  @Prop() fixGrammar: (
    payload: FixGrammarPayload,
    abortController?: AbortController
  ) => Promise<Result<FixGrammarResponse>>;

  @State() text: string = '';
  @State() context: string = '';
  @State() language: GoogleLanguage = 'en';
  @State() explanationLanguage: GoogleLanguage = 'en';
  @State() state: FixGrammarState = { status: 'idle' };

  private abortController: AbortController | null = null;
  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
    this.abortController?.abort();
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();

    this.abortController?.abort();
    this.abortController = new AbortController();

    this.state = { status: 'loading' };

    const payload: FixGrammarPayload = {
      text: this.text,
      language: this.language,
    };

    if (this.context.trim()) {
      payload.context = this.context.trim();
    }

    if (this.explanationLanguage) {
      payload.explanationLanguage = this.explanationLanguage;
    }

    const result = await this.fixGrammar(payload, this.abortController);

    if (this.abortController.signal.aborted) {
      return;
    }

    if (result.success) {
      this.state = { status: 'success', data: result.value };
    } else {
      this.state = {
        status: 'error',
        message: result.reason ?? 'An error occurred.',
      };
    }
  }

  private languageOptions() {
    return Object.entries(languageList)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  render() {
    const isLoading = this.state.status === 'loading';
    console.log('isLoading', isLoading);
    const canSubmit = this.text.trim() !== '';
    const languages = this.languageOptions();

    return (
      <Host>
        <form class="form" onSubmit={(e) => this.handleSubmit(e)}>
          <div class="field">
            <label class="label" htmlFor="fix-grammar-text">
              Sentence to check
            </label>
            <input
              type="text"
              id="fix-grammar-text"
              class="input"
              required
              value={this.text}
              onInput={(e) => {
                this.text = (e.target as HTMLInputElement).value;
              }}
            />
          </div>

          <div class="field">
            <label class="label" htmlFor="fix-grammar-context">
              Context <span class="optional">(optional)</span>
            </label>
            <input
              id="fix-grammar-context"
              class="input"
              type="text"
              value={this.context}
              onInput={(e) => {
                this.context = (e.target as HTMLInputElement).value;
              }}
            />
          </div>

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
                  if (isGoogleLanguage(val)) {
                    this.language = val;
                  }
                }}
              >
                {languages.map(({ code, name }) => (
                  <option value={code} selected={this.language === code}>
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
                  if (isGoogleLanguage(val)) {
                    this.explanationLanguage = val;
                  }
                }}
              >
                {languages.map(({ code, name }) => (
                  <option
                    value={code}
                    selected={this.explanationLanguage === code}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div class="submit-container">
            <button class="submit" type="submit" disabled={!canSubmit}>
              Check grammar
            </button>
            {isLoading && (
              <div class="loader">
                <vocably-inline-loader></vocably-inline-loader>
              </div>
            )}
          </div>
        </form>

        {this.state.status === 'error' && (
          <div class="result result--error">{this.state.message}</div>
        )}

        {this.state.status === 'success' && (
          <div class="result">
            {this.state.data.isCorrect ? (
              <div class="correct-badge">
                <vocably-icon-check class="correct-icon" />
                No grammar issues found
              </div>
            ) : (
              <div class="corrected-text">
                <div class="corrected-text__label">Corrected text</div>
                <div class="corrected-text__value">{this.state.data.text}</div>
              </div>
            )}
            <div
              class="explanation"
              innerHTML={mdConverter.makeHtml(this.state.data.explanation)}
            />
          </div>
        )}
      </Host>
    );
  }
}
