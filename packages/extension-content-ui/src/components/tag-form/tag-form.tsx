import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Prop,
  State,
} from '@stencil/core';
import { Result, TagCandidate, TagItem } from '@vocably/model';
import { subscribeToLocale, t } from '../../i18n';

@Component({
  tag: 'vocably-tag-form',
  styleUrl: 'tag-form.scss',
  shadow: true,
})
export class VocablyTagsMenu {
  @Element() el: HTMLElement;
  @Event() hide: EventEmitter<void>;

  @Prop() tagItem: TagItem | null = null;
  @Prop() saveTag?: (tag: TagCandidate) => Promise<Result<unknown>>;
  @Prop() deleteTag?: (tag: TagItem) => Promise<Result<unknown>>;

  @State() title: string = '';
  @State() saving = false;

  textInput!: HTMLInputElement;

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  componentDidLoad() {
    const initialTitle = this.tagItem ? this.tagItem.data.title : '';
    this.title = initialTitle;
    this.textInput.value = initialTitle;
    if (window.location.port !== '8010') {
      this.textInput.focus();
    }
  }

  isDisabled() {
    return this.saving || this.title.trim().length === 0;
  }

  async onSubmit() {
    if (this.isDisabled()) {
      return;
    }

    if (!this.saveTag) {
      this.hide.emit();
      return;
    }

    this.saving = true;

    const result = await this.saveTag({
      ...this.tagItem,
      data: {
        ...this.tagItem?.data,
        title: this.title.trim(),
      },
    });

    if (result.success === false) {
      alert(t('tag_form.save_error'));

      this.saving = false;
      return;
    }

    this.hide.emit();
  }

  async onDelete() {
    if (this.isDisabled()) {
      return;
    }

    if (!this.deleteTag || !this.tagItem) {
      this.hide.emit();
      return;
    }

    this.saving = true;

    const result = await this.deleteTag(this.tagItem);

    if (result.success === false) {
      alert(t('tag_form.delete_error'));

      this.saving = false;
      return;
    }

    this.hide.emit();
  }

  onInputChange() {
    this.title = this.textInput.value;
  }

  render() {
    return (
      <div class="tag-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.onSubmit();
            return false;
          }}
        >
          <label>
            <h1>
              {this.tagItem
                ? t('tag_form.new_name_for', { title: this.tagItem.data.title })
                : t('tag_form.new_tag_name')}
            </h1>
            <input
              type="text"
              placeholder={t('tag_form.placeholder')}
              onKeyUp={this.onInputChange.bind(this)}
              onChange={this.onInputChange.bind(this)}
              ref={(el) => (this.textInput = el as HTMLInputElement)}
            />
          </label>
          <div class="buttons">
            {this.tagItem && (
              <button
                class="delete"
                disabled={this.isDisabled()}
                type="button"
                onClick={() => {
                  const yesPlease = window.confirm(
                    t('tag_form.delete_confirm')
                  );

                  if (yesPlease) {
                    this.onDelete();
                  }
                }}
              >
                {t('tag_form.delete')}
              </button>
            )}
            <button
              type="button"
              class="cancel"
              onClick={() => this.hide.emit()}
            >
              {t('tag_form.cancel')}
            </button>
            <button type="submit" class="submit" disabled={this.isDisabled()}>
              {t('tag_form.save')}
            </button>
          </div>
          {this.saving && (
            <div class="loader">
              <vocably-spinner></vocably-spinner>
            </div>
          )}
        </form>
      </div>
    );
  }
}
