import { Component, Event, EventEmitter, h, Host, State } from '@stencil/core';

@Component({
  tag: 'vocably-button-copy',
  styleUrl: 'button-copy.scss',
  shadow: true,
})
export class VocablyButtonCopy {
  @State() copied = false;

  private timer: ReturnType<typeof setTimeout>;

  @Event() copy: EventEmitter<void>;

  disconnectedCallback() {
    clearTimeout(this.timer);
  }

  private handleClick = () => {
    this.copy.emit();
    this.copied = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.copied = false;
    }, 2000);
  };

  render() {
    return (
      <Host>
        <button
          class="button"
          onClick={this.handleClick}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          {this.copied ? <vocably-icon-check /> : <vocably-icon-copy />}
        </button>
      </Host>
    );
  }
}
