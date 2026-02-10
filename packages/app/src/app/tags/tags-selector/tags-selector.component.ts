import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { NewTag, TagItem } from '@vocably/model';
import { Subject, takeUntil } from 'rxjs';
import {
  TagFormAction,
  TagFormComponent,
  TagFormData,
} from '../tag-form/tag-form.component';

@Component({
  selector: 'app-tags-selector',
  templateUrl: './tags-selector.component.html',
  styleUrls: ['./tags-selector.component.scss'],
  imports: [
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NgIf,
    MatDivider,
    NgFor,
    MatIcon,
    MatIconButton,
  ],
})
export class TagsSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  @Input() selected: Array<TagItem | NewTag> = [];
  @Input() tags: Array<TagItem | NewTag> = [];
  @Output() onDeleteTag = new EventEmitter<TagItem | NewTag>();
  @Output() onSaveTag = new EventEmitter<TagItem | NewTag>();
  @Output() onAddNewTag = new EventEmitter<NewTag>();
  @Output() onSelect = new EventEmitter<TagItem | NewTag>();

  constructor(private dialog: MatDialog) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  showTagForm(tag: TagItem | NewTag | null = null) {
    const dialog = this.dialog.open<
      TagFormComponent,
      TagFormData,
      TagFormAction
    >(TagFormComponent, {
      data: {
        tag,
      },
    });

    dialog
      .beforeClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (action) => {
        if (!action) {
          return;
        }

        if (action.name === 'delete') {
          return this.deleteTag(action.tag);
        }

        if (action.name !== 'save') {
          return;
        }

        if (!tag) {
          return this.onAddNewTag.emit({
            data: {
              title: action.title,
            },
          });
        }

        tag.data.title = action.title;
        return this.saveTag(tag);
      });
  }

  async deleteTag(tag: TagItem | NewTag) {
    this.onDeleteTag.next(tag);
  }

  async saveTag(tag: TagItem | NewTag) {
    this.onSaveTag.next(tag);
  }
}
