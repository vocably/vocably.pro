import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
} from '@stencil/core';

@Component({
  tag: 'vocably-popup',
  styleUrl: 'popup.scss',
  shadow: true,
})
export class VocablyPopup {
  @Element() el: HTMLElement;
  @Event() close: EventEmitter<void>;

  componentDidRender() {
    if (!this.el.shadowRoot) {
      throw new Error('Shadow root property is empty');
    }

    const contentWrapper = this.el.shadowRoot.getElementById('content-wrapper');
    const content = this.el.shadowRoot.getElementById('content');

    if (!content || !contentWrapper) {
      throw new Error(`Can't find content or contentWrapper elements`);
    }

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        const rect = content.getBoundingClientRect();
        contentWrapper.style.width = `calc(${rect.width}px + 2 * var(--content-bleed))`;
        contentWrapper.style.height = `calc(${rect.height}px + 2 * var(--content-bleed))`;
      });
    });

    resizeObserver.observe(content);
  }

  render() {
    return (
      <Host>
        <div class="popup">
          <div class="body" id="body">
            <div class="content-wrapper" id="content-wrapper">
              <div class="content-unlimited">
                <div class="content" id="content">
                  <slot></slot>
                </div>
              </div>
            </div>
          </div>
          <div class="header">
            <vocably-logo class="logo"></vocably-logo>
            <vocably-close-button class="close"></vocably-close-button>
          </div>
          <div class="footer"></div>
        </div>
      </Host>
    );
  }
}
