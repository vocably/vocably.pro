import { Component, Fragment, h, Host, Prop } from '@stencil/core';
import {
  AudioPronunciationPayload,
  isGoogleTTSLanguage,
  Result,
  TranslationCard,
} from '@vocably/model';
import { sanitizeTranscript } from '@vocably/sulna';

@Component({
  tag: 'vocably-card-source',
  styleUrl: 'card-source.scss',
  shadow: false,
})
export class VocablyCardSource {
  @Prop() card: TranslationCard;
  @Prop() playAudioPronunciation: (
    payload: AudioPronunciationPayload
  ) => Promise<Result<true>>;

  render() {
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
        {this.card.data.tense !== 'past' && this.card.data.pastTenses && (
          <span class="vocably-muted vocably-small vocably-translation-margin-left">
            (past: {this.card.data.pastTenses})
          </span>
        )}

        {this.card.data.number === 'singular' && this.card.data.pluralForm && (
          <span class="vocably-muted vocably-small vocably-translation-margin-left">
            (plural: {this.card.data.pluralForm})
          </span>
        )}
      </Host>
    );
  }
}
