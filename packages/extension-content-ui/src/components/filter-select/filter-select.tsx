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
  Watch,
} from '@stencil/core';
import { subscribeToLocale, t } from '../../i18n';
import { filterGroups } from './filter';
import { FilterSelectGroup, FilterSelectOption } from './types';

const VIEWPORT_MARGIN = 8;
const PANEL_GAP = 4;
const PANEL_MIN_WIDTH = 240;
const PANEL_MAX_HEIGHT = 360;
// Below this much room under the trigger the panel opens upwards,
// provided there is more room above.
const PANEL_COMFORTABLE_HEIGHT = 220;
const PAGE_STEP = 8;

let instanceCounter = 0;

// The Popover API puts the panel into the top layer. Older browsers fall back
// to a fixed position with the highest z-index. (The TypeScript bundled with
// Stencil predates the API typings.)
type PopoverElement = HTMLElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

const showPopover = (element: HTMLElement) => {
  try {
    (element as PopoverElement).showPopover?.();
  } catch {
    // Already shown or disconnected.
  }
};

const hidePopover = (element: HTMLElement) => {
  try {
    (element as PopoverElement).hidePopover?.();
  } catch {
    // Already hidden or disconnected.
  }
};

/**
 * A select whose dropdown has a text field filtering the options by their
 * labels and aliases.
 *
 * Slots:
 * - `prefix` - content shown in the trigger before the selected label;
 * - `trigger` - replaces the selected label in the trigger.
 *
 * Parts:
 * - `trigger` - the button opening the dropdown.
 *
 * The host has the `focus-visible` class while the trigger has keyboard focus.
 *
 * With `name` set, the element takes part in the submission of its form
 * just like a native select (through a hidden input in its light DOM).
 */
@Component({
  tag: 'vocably-filter-select',
  styleUrl: 'filter-select.scss',
  shadow: true,
})
export class VocablyFilterSelect {
  @Element() el: HTMLElement;

  @Prop() optionGroups: FilterSelectGroup[] = [];
  @Prop({ mutable: true }) value: string = '';
  @Prop() disabled = false;
  @Prop() name?: string;
  /** Accessible name of the select. */
  @Prop() label?: string;
  @Prop() filterPlaceholder?: string;
  @Prop() noResultsText?: string;
  /** `plain` drops the trigger background and chevron. */
  @Prop() variant: 'default' | 'plain' = 'default';

  @Event() choose: EventEmitter<string>;

  @State() isOpen = false;
  @State() query = '';
  @State() activeValue: string | undefined;
  // The host doesn't match :focus-visible when the trigger inside its shadow
  // root has it, so it's mirrored as a host class for outside styling.
  @State() triggerFocusVisible = false;

  private readonly id = `vfs-${++instanceCounter}`;
  private trigger?: HTMLButtonElement;
  private panel?: HTMLDivElement;
  private list?: HTMLUListElement;
  private filterInput?: HTMLInputElement;
  private unsubLocale?: () => void;
  private justOpened = false;
  private hiddenInput?: HTMLInputElement;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
    this.removeGlobalListeners();
  }

  componentWillLoad() {
    this.syncFormValue();
  }

  @Watch('value')
  @Watch('name')
  syncFormValue() {
    if (!this.name) {
      this.hiddenInput?.remove();
      this.hiddenInput = undefined;
      return;
    }

    if (!this.hiddenInput) {
      this.hiddenInput = document.createElement('input');
      this.hiddenInput.type = 'hidden';
      this.el.appendChild(this.hiddenInput);
    }

    this.hiddenInput.name = this.name;
    this.hiddenInput.value = this.value ?? '';
  }

  @Watch('disabled')
  onDisabledChange(disabled: boolean) {
    if (disabled) {
      this.close(false);
    }
  }

  componentDidRender() {
    if (!this.justOpened || !this.panel) {
      return;
    }

    this.justOpened = false;
    this.position();
    showPopover(this.panel);
    this.scrollActiveIntoView('center');

    // Like a native select on touch devices, don't pop the keyboard up
    // right away: the visitor taps the filter field when they need it.
    if (!window.matchMedia('(pointer: coarse)').matches) {
      this.filterInput?.focus({ preventScroll: true });
    }
  }

  private get filteredGroups(): FilterSelectGroup[] {
    return filterGroups(this.optionGroups ?? [], this.query);
  }

  private get selectedOption(): FilterSelectOption | undefined {
    for (const group of this.optionGroups ?? []) {
      const option = group.options.find(({ value }) => value === this.value);
      if (option) {
        return option;
      }
    }
    return undefined;
  }

  private open(query = '') {
    if (this.isOpen || this.disabled) {
      return;
    }

    this.query = query;
    this.activeValue =
      query === '' && this.selectedOption
        ? this.value
        : this.filteredGroups[0]?.options[0]?.value;
    this.isOpen = true;
    this.justOpened = true;
    this.addGlobalListeners();
  }

  private close(returnFocus: boolean) {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.query = '';
    this.removeGlobalListeners();

    if (this.panel) {
      hidePopover(this.panel);
    }

    if (returnFocus) {
      this.trigger?.focus({ preventScroll: true });
    }
  }

  private select(value: string) {
    this.close(true);

    if (value === this.value) {
      return;
    }

    this.value = value;
    this.choose.emit(value);
  }

  private addGlobalListeners() {
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    window.addEventListener('resize', this.onViewportChange);
    window.addEventListener('scroll', this.onViewportChange, true);
    window.visualViewport?.addEventListener('resize', this.onViewportChange);
    window.visualViewport?.addEventListener('scroll', this.onViewportChange);
  }

  private removeGlobalListeners() {
    document.removeEventListener(
      'pointerdown',
      this.onDocumentPointerDown,
      true
    );
    window.removeEventListener('resize', this.onViewportChange);
    window.removeEventListener('scroll', this.onViewportChange, true);
    window.visualViewport?.removeEventListener('resize', this.onViewportChange);
    window.visualViewport?.removeEventListener('scroll', this.onViewportChange);
  }

  private onDocumentPointerDown = (event: PointerEvent) => {
    if (!event.composedPath().includes(this.el)) {
      this.close(false);
    }
  };

  private onViewportChange = (event: Event) => {
    // Scrolling the option list doesn't move the panel.
    if (this.list && event.composedPath?.().includes(this.list)) {
      return;
    }
    this.position();
  };

  /**
   * The panel lives in the top layer (popover) with fixed coordinates, so
   * that it escapes the overflow of popups and scrollable containers.
   */
  private position() {
    if (!this.trigger || !this.panel) {
      return;
    }

    const rect = this.trigger.getBoundingClientRect();
    const layoutWidth = document.documentElement.clientWidth;
    const layoutHeight = window.innerHeight;
    const viewport = window.visualViewport;
    // The visible area within the layout viewport: on mobile the on-screen
    // keyboard shrinks the visual viewport only.
    const visibleTop = viewport ? viewport.offsetTop : 0;
    const visibleLeft = viewport ? viewport.offsetLeft : 0;
    const visibleBottom = viewport
      ? viewport.offsetTop + viewport.height
      : layoutHeight;
    const visibleRight = viewport
      ? viewport.offsetLeft + viewport.width
      : layoutWidth;

    const availableWidth = visibleRight - visibleLeft - VIEWPORT_MARGIN * 2;
    const width = Math.min(
      Math.max(rect.width, PANEL_MIN_WIDTH),
      availableWidth
    );
    const left = Math.min(
      Math.max(rect.left, visibleLeft + VIEWPORT_MARGIN),
      visibleRight - VIEWPORT_MARGIN - width
    );

    const spaceBelow =
      visibleBottom - rect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - visibleTop - PANEL_GAP - VIEWPORT_MARGIN;
    const above =
      spaceBelow < PANEL_COMFORTABLE_HEIGHT && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      Math.min(PANEL_MAX_HEIGHT, above ? spaceAbove : spaceBelow),
      120
    );

    const style = this.panel.style;
    style.left = `${left}px`;
    style.width = `${width}px`;
    style.maxHeight = `${maxHeight}px`;
    if (above) {
      style.top = 'auto';
      style.bottom = `${layoutHeight - rect.top + PANEL_GAP}px`;
    } else {
      style.top = `${rect.bottom + PANEL_GAP}px`;
      style.bottom = 'auto';
    }
    this.panel.classList.toggle('above', above);
  }

  private get visibleValues(): string[] {
    return this.filteredGroups.flatMap(({ options }) =>
      options.map(({ value }) => value)
    );
  }

  private moveActive(delta: number) {
    const values = this.visibleValues;
    if (values.length === 0) {
      return;
    }

    const index = this.activeValue ? values.indexOf(this.activeValue) : -1;
    const next =
      index === -1
        ? delta > 0
          ? 0
          : values.length - 1
        : Math.min(Math.max(index + delta, 0), values.length - 1);

    this.activeValue = values[next];
    requestAnimationFrame(() => this.scrollActiveIntoView('nearest'));
  }

  private scrollActiveIntoView(block: 'center' | 'nearest') {
    if (!this.list) {
      return;
    }

    const option = this.list.querySelector<HTMLElement>('.option.active');
    if (!option) {
      this.list.scrollTop = 0;
      return;
    }

    const list = this.list;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;

    if (block === 'center') {
      list.scrollTop = top - (list.clientHeight - option.offsetHeight) / 2;
    } else if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }

  private onTriggerKeyDown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }

    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.open();
      return;
    }

    // Typing on a closed select starts filtering right away.
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      this.open(event.key);
    }
  };

  private onFilterKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'PageDown':
        event.preventDefault();
        this.moveActive(PAGE_STEP);
        break;
      case 'PageUp':
        event.preventDefault();
        this.moveActive(-PAGE_STEP);
        break;
      case 'Enter':
        event.preventDefault();
        if (
          this.activeValue !== undefined &&
          this.visibleValues.includes(this.activeValue)
        ) {
          this.select(this.activeValue);
        }
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close(true);
        break;
      case 'Tab':
        this.close(true);
        break;
    }
  };

  private onFilterInput = (event: Event) => {
    this.query = (event.target as HTMLInputElement).value;
    this.activeValue = this.filteredGroups[0]?.options[0]?.value;
    requestAnimationFrame(() => {
      if (this.list) {
        this.list.scrollTop = 0;
      }
    });
  };

  private optionId(value: string) {
    return `${this.id}-option-${value}`;
  }

  private renderOption(option: FilterSelectOption) {
    const selected = option.value === this.value;
    const active = option.value === this.activeValue;

    return (
      <li
        id={this.optionId(option.value)}
        role="option"
        class={{ option: true, selected, active }}
        aria-selected={selected ? 'true' : 'false'}
        // Keep the focus in the filter field.
        onMouseDown={(event) => event.preventDefault()}
        onPointerMove={() => {
          if (this.activeValue !== option.value) {
            this.activeValue = option.value;
          }
        }}
        onClick={() => this.select(option.value)}
      >
        <span class="option-label">{option.label}</span>
        {selected && (
          <svg
            class="check"
            viewBox="0 0 24 24"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </li>
    );
  }

  render() {
    const listboxId = `${this.id}-listbox`;
    const groups = this.isOpen ? this.filteredGroups : [];
    const hasResults = groups.length > 0;
    const activeDescendant =
      this.activeValue !== undefined &&
      groups.some((group) =>
        group.options.some(({ value }) => value === this.activeValue)
      )
        ? this.optionId(this.activeValue)
        : undefined;

    return (
      <Host
        class={{
          open: this.isOpen,
          'focus-visible': this.triggerFocusVisible,
          [`variant-${this.variant}`]: true,
        }}
      >
        <button
          type="button"
          class="trigger"
          part="trigger"
          // Safari skips buttons on Tab unless they have an explicit tabindex
          // (a native select is reachable there, so this one must be too).
          tabIndex={this.disabled ? -1 : 0}
          ref={(el) => (this.trigger = el)}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={this.isOpen ? 'true' : 'false'}
          aria-controls={listboxId}
          aria-label={this.label}
          disabled={this.disabled}
          onClick={() => (this.isOpen ? this.close(true) : this.open())}
          onKeyDown={this.onTriggerKeyDown}
          onFocus={(event) => {
            this.triggerFocusVisible = (event.target as HTMLElement).matches(
              ':focus-visible'
            );
          }}
          onBlur={() => (this.triggerFocusVisible = false)}
        >
          <slot name="prefix" />
          <span class="value">
            <slot name="trigger">{this.selectedOption?.label ?? ''}</slot>
          </span>
          {this.variant !== 'plain' && (
            <svg
              class="chevron"
              viewBox="0 0 11 7"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 1 5 6 1 1" />
            </svg>
          )}
        </button>
        <div
          class={{ panel: true, open: this.isOpen }}
          ref={(el) => (this.panel = el)}
          {...{ popover: 'manual' }}
        >
          {this.isOpen && (
            <div class="filter">
              <svg
                class="filter-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5" />
              </svg>
              <input
                ref={(el) => (this.filterInput = el)}
                class="filter-input"
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-activedescendant={activeDescendant}
                aria-label={
                  this.filterPlaceholder ?? t('select.filter_placeholder')
                }
                placeholder={
                  this.filterPlaceholder ?? t('select.filter_placeholder')
                }
                autocomplete="off"
                autocorrect="off"
                autocapitalize="none"
                spellcheck={false}
                enterKeyHint="go"
                value={this.query}
                onInput={this.onFilterInput}
                onKeyDown={this.onFilterKeyDown}
              />
            </div>
          )}
          <ul
            id={listboxId}
            class="list"
            role="listbox"
            aria-label={this.label}
            ref={(el) => (this.list = el)}
          >
            {groups.map((group, index) =>
              group.label === '' ? (
                group.options.map((option) => this.renderOption(option))
              ) : (
                <li role="presentation" class="group">
                  <div
                    class="group-label"
                    id={`${this.id}-group-${index}`}
                    role="presentation"
                  >
                    {group.label}
                  </div>
                  <ul
                    role="group"
                    class="group-options"
                    aria-labelledby={`${this.id}-group-${index}`}
                  >
                    {group.options.map((option) => this.renderOption(option))}
                  </ul>
                </li>
              )
            )}
          </ul>
          {this.isOpen && !hasResults && (
            <div class="no-results" role="status">
              {this.noResultsText ?? t('select.no_results')}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
