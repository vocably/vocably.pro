import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'vocably-icon-send',
  styleUrl: 'icon-send.scss',
  shadow: true,
})
export class VocablyIconSend {
  render() {
    return (
      <Host>
        <svg class="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M3 20V4L22 12M5 17L16.85 12L5 7V10.5L11 12L5 13.5M5 17V7 13.5Z" />
        </svg>
      </Host>
    );
  }
}
