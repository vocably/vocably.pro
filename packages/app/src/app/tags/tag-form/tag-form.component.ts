import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { isTagItem, NewTag, TagItem } from '@vocably/model';
import { Subject, takeUntil } from 'rxjs';
import {
  DeleteConfirmationComponent,
  DeleteConfirmationData,
} from '../delete-confirmation/delete-confirmation.component';

export type TagFormData = {
  tag: TagItem | NewTag | null;
};

export type TagFormActionDelete = {
  name: 'delete';
  tag: TagItem | NewTag;
};

export type TagFormActionSave = {
  name: 'save';
  title: string;
};

export type TagFormAction = TagFormActionDelete | TagFormActionSave;

@Component({
  selector: 'app-tag-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.scss'],
  standalone: false,
})
export class TagFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public title = '';

  constructor(
    public dialogRef: MatDialogRef<TagFormComponent, TagFormAction>,
    @Inject(MAT_DIALOG_DATA) public data: TagFormData,
    public dialog: MatDialog
  ) {
    if (data.tag) {
      this.title = data.tag.data.title;
    }
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onDeleteClick() {
    if (!isTagItem(this.data.tag) && this.data.tag) {
      this.dialogRef.close({
        name: 'delete',
        tag: this.data.tag,
      });

      return;
    }

    if (!isTagItem(this.data.tag)) {
      this.dialogRef.close();
      return;
    }

    const ref = this.dialog.open<
      DeleteConfirmationComponent,
      DeleteConfirmationData,
      undefined | true
    >(DeleteConfirmationComponent, {
      data: {
        tag: this.data.tag,
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (!result) {
          return;
        }

        if (!this.data.tag) {
          this.dialogRef.close();
          return;
        }

        this.dialogRef.close({
          name: 'delete',
          tag: this.data.tag,
        });
      });
  }

  submit() {
    if (this.title.trim() === '') {
      return;
    }

    this.dialogRef.close({
      name: 'save',
      title: this.title,
    });
  }
}
