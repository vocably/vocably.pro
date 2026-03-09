import { Component, Element, forceUpdate, h, Host } from '@stencil/core';
import { subscribeToLocale, t } from '../../i18n';

@Component({
  tag: 'vocably-mobile-button',
  styleUrl: 'mobile-button.scss',
  shadow: true,
})
export class VocablyMobileButton {
  @Element() el: HTMLElement;

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
        <button class="button" onTouchStart={() => true}>
          <svg viewBox="0 0 633 699" fill="none" class="svg">
            <path
              d="M585.428 130.443H46.6646C21.2112 130.443 0 150.809 0 177.116V482.609C0 508.067 20.3627 529.281 46.6646 529.281H82.2994V639.599C82.2994 662.511 95.026 682.877 114.54 693.06C122.176 697.303 130.661 699 139.145 699C151.872 699 163.75 694.757 174.78 687.12L352.954 530.13H585.428C610.882 530.13 632.093 509.764 632.093 483.457V177.964C632.093 151.658 610.882 130.443 585.428 130.443ZM150.175 654.874C142.539 660.814 135.752 658.268 133.206 656.57C130.661 654.873 123.873 650.63 123.873 639.599V340.045C123.873 320.527 137.448 291.676 152.72 278.947L320.713 132.989V504.672L150.175 654.874Z"
              fill="#0050FF"
            />
            <path
              d="M524.34 36.2492C524.34 10.7914 497.19 -13.8184 464.949 9.09357L355.499 101.59H524.34V36.2492Z"
              fill="#0050FF"
            />
          </svg>
          <span class="caption">{t('mobile_button.look_up')}</span>
        </button>
      </Host>
    );
  }
}
