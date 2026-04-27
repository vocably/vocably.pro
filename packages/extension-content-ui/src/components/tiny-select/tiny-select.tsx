import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
  Watch,
} from '@stencil/core';

@Component({
  tag: 'vocably-tiny-select',
  styleUrl: 'tiny-select.scss',
  shadow: false,
})
export class VocablyTinySelect {
  @Element() el: HTMLElement;

  @Prop() value?: string;
  @Prop() label?: string;
  @Prop() disabled = false;

  @Event() choose: EventEmitter<string>;

  @State() selectedLabel = '';

  private capturedChildren: Node[] = [];
  private selectEl?: HTMLSelectElement;

  componentWillLoad() {
    this.capturedChildren = Array.from(this.el.childNodes);
    this.capturedChildren.forEach((node) => node.parentNode?.removeChild(node));
  }

  componentDidLoad() {
    if (!this.selectEl) {
      return;
    }
    this.capturedChildren.forEach((node) => this.selectEl!.appendChild(node));
    if (this.value !== undefined) {
      this.selectEl.value = this.value;
    }
    this.syncSelectedLabel();
  }

  @Watch('value')
  onValueChange(newValue: string | undefined) {
    if (
      this.selectEl &&
      newValue !== undefined &&
      this.selectEl.value !== newValue
    ) {
      this.selectEl.value = newValue;
      this.syncSelectedLabel();
    }
  }

  private syncSelectedLabel() {
    if (!this.selectEl) {
      return;
    }
    const opt = this.selectEl.options[this.selectEl.selectedIndex];
    this.selectedLabel = opt ? opt.text : '';
  }

  private handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.choose.emit(target.value);
    this.syncSelectedLabel();
  };

  render() {
    return (
      <Host>
        <span class="tiny-select-wrapper">
          <span class="tiny-select-mirror" aria-hidden="true">
            {this.selectedLabel}
          </span>
          <select
            class="tiny-select-input"
            aria-label={this.label}
            disabled={this.disabled}
            ref={(el) => (this.selectEl = el as HTMLSelectElement)}
            onChange={this.handleChange}
          />
        </span>
      </Host>
    );
  }
}
