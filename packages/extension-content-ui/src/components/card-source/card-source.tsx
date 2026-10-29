import {
  Build,
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  Fragment,
  h,
  Host,
  Prop,
  State,
} from '@stencil/core';
import {
  AudioPronunciationPayload,
  isGoogleTTSLanguage,
  Result,
  TranslationCard,
} from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import { subscribeToLocale, t } from '../../i18n';
import { frequencyToLevel } from '../frequency-hint/frequency';
import { FrequencyHoverPayload } from './types';

const FREQUENCY_BARS = 3;

// Lets the pointer cross the gap between the indicator and the hint, so the
// hint text can be selected.
const HINT_HIDE_DELAY = 200;

let hintIdCounter = 0;

@Component({
  tag: 'vocably-card-source',
  styleUrl: 'card-source.scss',
  shadow: false,
})
export class VocablyCardSource {
  @Element() el: HTMLElement;
  @Prop() card: TranslationCard;
  @Prop() isPaid: boolean = false;
  @Prop() isLoggedIn: boolean = false;
  @Prop() paymentLink: string = '';
  @Prop() playAudioPronunciation: (
    payload: AudioPronunciationPayload
  ) => Promise<Result<true>>;

  @Event({ bubbles: false }) watchMePaying: EventEmitter<void>;
  // Bubbles out of the shadow roots, so whoever renders `vocably-translation`
  // can report it to analytics.
  @Event() frequencyHover: EventEmitter<FrequencyHoverPayload>;

  @State() isFrequencyHintVisible = false;

  private unsubLocale: (() => void) | undefined;
  private frequencyEl: HTMLElement | undefined;
  private hideHintTimeout: ReturnType<typeof setTimeout> | undefined;
  // The hint stays open while any of these holds. A text selection started in
  // the hint keeps it open until the button is released, even if the pointer
  // leaves the hint while dragging.
  private hintHolders = {
    anchorHover: false,
    anchorFocus: false,
    hintHover: false,
    hintSelection: false,
  };
  private frequencyHintId = `vocably-frequency-hint-${++hintIdCounter}`;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
    clearTimeout(this.hideHintTimeout);
    document.removeEventListener('mouseup', this.onHintSelectionEnd, true);
  }

  private holdFrequencyHint(
    holder: keyof VocablyCardSource['hintHolders'],
    isHolding: boolean
  ) {
    this.hintHolders[holder] = isHolding;
    clearTimeout(this.hideHintTimeout);

    if (isHolding) {
      this.isFrequencyHintVisible = true;
      return;
    }

    this.hideHintTimeout = setTimeout(() => {
      if (!Object.values(this.hintHolders).some(Boolean)) {
        this.isFrequencyHintVisible = false;
      }
    }, HINT_HIDE_DELAY);
  }

  private onHintSelectionStart = () => {
    this.holdFrequencyHint('hintSelection', true);
    document.addEventListener('mouseup', this.onHintSelectionEnd, true);
  };

  private onHintSelectionEnd = () => {
    document.removeEventListener('mouseup', this.onHintSelectionEnd, true);
    this.holdFrequencyHint('hintSelection', false);
  };

  private renderFrequency(frequency: number) {
    const level = frequencyToLevel(frequency);
    const label = t(`card_source.frequency_${level}`);

    return (
      <Fragment>
        <span class="vocably-invisible-space">&nbsp;</span>
        <span
          class={{
            'vocably-frequency': true,
            'vocably-frequency-active': this.isFrequencyHintVisible,
          }}
          aria-describedby={Build.isBrowser ? this.frequencyHintId : undefined}
          tabIndex={0}
          ref={(el) => (this.frequencyEl = el)}
          onMouseEnter={() => {
            // Moving back from the hint to the indicator isn't a new hover.
            if (!this.isFrequencyHintVisible) {
              this.frequencyHover.emit({
                source: this.card.data.source,
                language: this.card.data.language,
                frequency,
                level,
              });
            }
            this.holdFrequencyHint('anchorHover', true);
          }}
          onMouseLeave={() => this.holdFrequencyHint('anchorHover', false)}
          onFocus={() => this.holdFrequencyHint('anchorFocus', true)}
          onBlur={() => this.holdFrequencyHint('anchorFocus', false)}
        >
          {Array.from({ length: FREQUENCY_BARS }, (_, index) => (
            <span
              class={{
                'vocably-frequency-bar': true,
                'vocably-frequency-bar-filled': index < level,
              }}
              aria-hidden="true"
            />
          ))}
          {/* Real text rather than aria-label, so crawlers index the level
              along with the word and screen readers read it in place. Goes
              after the bars, which are sized by :nth-child. */}
          <span class="vocably-frequency-label">{label}</span>
        </span>
        {/* Rendered only on the client to keep the hint out of SSR output. */}
        {Build.isBrowser && (
          <vocably-frequency-hint
            id={this.frequencyHintId}
            frequency={frequency}
            isPaid={this.isPaid}
            isLoggedIn={this.isLoggedIn}
            paymentLink={this.paymentLink}
            onWatchMePaying={() => this.watchMePaying.emit()}
            visible={this.isFrequencyHintVisible}
            anchor={this.frequencyEl}
            onMouseEnter={() => this.holdFrequencyHint('hintHover', true)}
            onMouseLeave={() => this.holdFrequencyHint('hintHover', false)}
            onMouseDown={this.onHintSelectionStart}
          />
        )}
      </Fragment>
    );
  }

  render() {
    if (this.card === undefined) {
      return <div>Card is undefined</div>;
    }

    const past = this.card.data.tense !== 'past' && this.card.data.pastTenses;
    return (
      <Host>
        {isGoogleTTSLanguage(this.card.data.language) && (
          <vocably-play-sound
            text={this.card.data.source}
            language={this.card.data.language}
            playAudioPronunciation={this.playAudioPronunciation}
          />
        )}
        <span class="vocably-emphasized">{this.card.data.source}</span>
        {typeof this.card.data.frequency === 'number' &&
          this.renderFrequency(this.card.data.frequency)}
        {this.card.data.ipa && (
          <Fragment>
            <span class="vocably-invisible-space">&nbsp;</span>
            <span class="vocably-translation-margin-left vocably-muted">
              /{sanitizeTranscript(this.card.data.ipa)}/
            </span>
          </Fragment>
        )}
        {this.card.data.g && (
          <Fragment>
            <span class="vocably-invisible-space">&nbsp;</span>
            <span class="vocably-muted vocably-small vocably-translation-margin-left">
              ({this.card.data.g})
            </span>
          </Fragment>
        )}
        {this.card.data.partOfSpeech && (
          <Fragment>
            <span class="vocably-invisible-space ">&nbsp;</span>
            <span class="vocably-muted vocably-small vocably-translation-margin-left">
              {this.card.data.partOfSpeech}
            </span>
          </Fragment>
        )}
        {this.card.data.presentTenses && (
          <Fragment>
            {past && <br />}
            <span class="vocably-muted vocably-small vocably-translation-margin-left">
              (present: {this.card.data.presentTenses})
            </span>
          </Fragment>
        )}
        {past && (
          <Fragment>
            {this.card.data.presentTenses && <br />}
            <span class="vocably-muted vocably-small vocably-translation-margin-left">
              (past: {past})
            </span>
          </Fragment>
        )}

        {this.card.data.number === 'singular' &&
          isGoodPlural(this.card.data.pluralForm) && (
            <span class="vocably-muted vocably-small vocably-translation-margin-left">
              (plural: {this.card.data.pluralForm})
            </span>
          )}
      </Host>
    );
  }
}
