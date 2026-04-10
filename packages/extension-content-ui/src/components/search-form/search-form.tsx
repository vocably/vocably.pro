import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Host,
  Prop,
  State,
} from '@stencil/core';
import {
  GoogleLanguage,
  isGoogleLanguage,
  languageList,
  LanguagePairs,
} from '@vocably/model';
import { uniq } from 'lodash-es';
import { subscribeToLocale, t } from '../../i18n';
import { SearchValues } from './types';

const article = (phrase: string) => {
  if (
    ['a', 'e', 'i', 'o', 'y', 'u'].includes((phrase.at(0) ?? '').toLowerCase())
  ) {
    return 'an';
  } else {
    return 'a';
  }
};

@Component({
  tag: 'vocably-search-form',
  styleUrl: 'search-form.scss',
  shadow: true,
})
export class VocablySearchForm {
  @Element() el: HTMLElement;
  @Prop() loading: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() existingSourceLanguages: GoogleLanguage[] = [];
  @Prop() existingTargetLanguages: GoogleLanguage[] = [];
  @Prop() hideHint: boolean = false;
  @Prop() autoFocus: boolean = false;
  @Prop() languagePairs: LanguagePairs = {};

  @Prop() values: SearchValues = {
    text: '',
    sourceLanguage: 'de',
    targetLanguage: 'en',
    isReversed: false,
  };
  @Event() valuesChange: EventEmitter<SearchValues>;
  @Event() formSubmit: EventEmitter<SearchValues>;

  @State() textInputFocused: boolean = false;

  private textInput: HTMLInputElement | undefined = undefined;
  private unsubLocale: (() => void) | undefined;

  componentDidLoad() {
    if (this.autoFocus) {
      setTimeout(() => {
        this.textInput?.focus();
      }, 300);
    }
  }

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  languageName(languageCode: string): string {
    // @ts-ignore
    return t(`nominative_${languageCode}`) ?? '';
  }

  getPlaceholderText(): string {
    if (!this.values.sourceLanguage || !this.values.targetLanguage) {
      return '';
    }

    const targetLanguageName = this.languageName(this.values.targetLanguage);

    if (this.values.isReversed) {
      return t('search.placeholder_reversed', {
        article: article(targetLanguageName),
        language: targetLanguageName,
        source: t(`objective_${this.values.sourceLanguage}`),
      });
    }

    return t('search.placeholder_default');
  }

  getSourceLanguageGroups(): any {
    const { preferred, available } = Object.keys(languageList).reduce<{
      preferred: string[];
      available: string[];
    }>(
      (acc, language) => {
        if (this.languagePairs.hasOwnProperty(language)) {
          return {
            ...acc,
            preferred: [...acc.preferred, language],
          };
        } else {
          return {
            ...acc,
            available: [...acc.available, language],
          };
        }
      },
      {
        preferred: [],
        available: [],
      }
    );

    const availableGroup = [
      t('search.available_languages'),
      available
        .map((lng) => [lng, this.languageName(lng)] as const)
        .sort(([_, lngA], [__, lngB]) => {
          return lngA.localeCompare(lngB);
        }),
    ] as const;

    if (preferred.length === 0) {
      return [availableGroup];
    }

    return [
      [
        t('search.preferred_languages'),
        preferred.map((lng) => [lng, this.languageName(lng)] as const),
      ],
      availableGroup,
    ];
  }

  getTargetLanguageGroups(): any {
    const allPreferredLanguages: string[] = uniq(
      Object.values(this.languagePairs).flatMap(
        (pairs) => pairs.possibleTargetLanguages
      )
    );

    const { preferred, available } = Object.keys(languageList).reduce<{
      preferred: string[];
      available: string[];
    }>(
      (acc, language) => {
        if (allPreferredLanguages.includes(language)) {
          return {
            ...acc,
            preferred: [...acc.preferred, language],
          };
        } else {
          return {
            ...acc,
            available: [...acc.available, language],
          };
        }
      },
      {
        preferred: [],
        available: [],
      }
    );

    const availableGroup = [
      t('search.available_languages'),
      available
        .map((lng) => [lng, this.languageName(lng)] as const)
        .sort(([_, lngA], [__, lngB]) => {
          return lngA.localeCompare(lngB);
        }),
    ] as const;

    if (preferred.length === 0) {
      return [availableGroup];
    }

    return [
      [
        t('search.preferred_languages'),
        preferred.map((lng) => [lng, this.languageName(lng)] as const),
      ],
      availableGroup,
    ];
  }

  getTargetLanguageCandidate(sourceLanguage: string): string {
    if (
      !isGoogleLanguage(sourceLanguage) ||
      !this.languagePairs.hasOwnProperty(sourceLanguage)
    ) {
      return this.values.targetLanguage;
    }

    return (
      this.languagePairs[sourceLanguage]?.currentTargetLanguage ??
      this.values.targetLanguage
    );
  }

  render() {
    return (
      <Host>
        <form
          class="form"
          onSubmit={(e) => {
            e.preventDefault();
            this.formSubmit.emit(this.values);
          }}
          aria-label="Search form"
        >
          <div class="preset">
            <vocably-hint-selector
              class="language"
              hint={t('search.i_study')}
              shrinkSmall={true}
              disabled={this.loading || this.disabled}
              onChoose={(event) =>
                this.valuesChange.emit({
                  ...this.values,
                  sourceLanguage: event.detail,
                  targetLanguage: this.getTargetLanguageCandidate(event.detail),
                })
              }
              value={this.values.sourceLanguage}
              optionGroups={this.getSourceLanguageGroups()}
            ></vocably-hint-selector>
            <div>
              <button
                type="button"
                class={{ direction: true, reversed: this.values.isReversed }}
                onClick={() =>
                  this.valuesChange.emit({
                    ...this.values,
                    isReversed: !this.values.isReversed,
                  })
                }
              >
                <vocably-icon-arrow-right class="icon"></vocably-icon-arrow-right>
              </button>
            </div>
            <vocably-hint-selector
              class={'language'}
              hint={t('search.i_speak')}
              shrinkSmall={true}
              disabled={this.loading || this.disabled}
              onChoose={(event) =>
                this.valuesChange.emit({
                  ...this.values,
                  targetLanguage: event.detail,
                })
              }
              value={this.values.targetLanguage}
              optionGroups={this.getTargetLanguageGroups()}
            ></vocably-hint-selector>
          </div>
          <div class="search-input">
            <input
              ref={(el) => {
                this.textInput = el;
              }}
              aria-haspopup="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="none"
              class="input"
              type="text"
              name="searchText"
              placeholder={this.getPlaceholderText()}
              value={this.values.text}
              disabled={this.loading || this.disabled}
              onFocus={() => (this.textInputFocused = true)}
              onBlur={() => (this.textInputFocused = false)}
              onKeyUp={(e) => {
                this.valuesChange.emit({
                  ...this.values,
                  // @ts-ignore
                  text: e.target.value,
                });
              }}
            />
            <button
              class="submit"
              type="submit"
              disabled={this.loading || this.values.text.trim() === ''}
            >
              <vocably-icon-magnify
                class={{
                  magnify: true,
                  animating: this.loading,
                }}
              ></vocably-icon-magnify>
            </button>
          </div>
          {!this.hideHint && (
            <div class="hint">
              {t('search.hint', {
                language: t(`objective_${this.values.sourceLanguage}`),
              })}
            </div>
          )}
        </form>
      </Host>
    );
  }
}
