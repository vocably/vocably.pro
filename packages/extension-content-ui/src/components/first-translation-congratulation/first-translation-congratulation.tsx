import '@sneas/telephone';
import { Component, Element, forceUpdate, h, Host, Prop } from '@stencil/core';
import { TranslationCard } from '@vocably/model';
import { explode } from '@vocably/sulna';
import { subscribeToLocale, t } from '../../i18n';

@Component({
  tag: 'vocably-first-translation-congratulation',
  styleUrl: 'first-translation-congratulation.scss',
  shadow: true,
})
export class VocablyFirstTranslationCongratulation {
  @Element() el: HTMLElement;
  @Prop() card: TranslationCard;

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  render() {
    const examples = explode(this.card.data.example ?? '');
    const definitions = explode(this.card.data.definition ?? '');

    return (
      <Host>
        <div class="row">
          <div class="col">
            <iphone-16-max class="phone">
              <div class="phone-bg">
                <div class="card">
                  <div class="card-side-wrapper front">
                    <div class="card-side">
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          flexWrap: 'wrap',
                          columnGap: '4px',
                        }}
                      >
                        <div class="emphasize small">
                          {this.card.data.source}
                        </div>
                        {this.card.data.ipa && (
                          <div class="small">[{this.card.data.ipa}]</div>
                        )}
                        {this.card.data.g && (
                          <div class="small">({this.card.data.g})</div>
                        )}
                        {this.card.data.partOfSpeech && (
                          <div class="small">{this.card.data.partOfSpeech}</div>
                        )}
                      </div>
                      {examples.length === 1 && (
                        <div class="small">{examples[0]}</div>
                      )}
                      {examples.length > 1 && (
                        <ul class="small vocably-list">
                          {examples.map((item) => (
                            <li>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div class="card-side-wrapper back">
                    <div class="card-side">
                      {definitions.length > 0 && (
                        <ul class="small vocably-list">
                          {this.card.data.translation && (
                            <li class="emphasize">
                              {this.card.data.translation}
                            </li>
                          )}
                          {definitions.map((item) => (
                            <li>{item}</li>
                          ))}
                        </ul>
                      )}
                      {definitions.length === 0 && (
                        <div class="emphasize small">
                          {this.card.data.translation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </iphone-16-max>
          </div>
          <div class="col">
            <p>
              <span class="emphasize">{this.card.data.source}</span>{' '}
              {t('congrats.on_phone')}
            </p>
            <p>{t('congrats.scan_qr')}</p>
            <vocably-qr-code style={{ width: '200px' }}></vocably-qr-code>
          </div>
        </div>
      </Host>
    );
  }
}
