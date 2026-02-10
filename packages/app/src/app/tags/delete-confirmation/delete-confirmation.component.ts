import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TagItem } from '@vocably/model';

export type DeleteConfirmationData = {
  tag: TagItem;
};

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
  ],
})
export class DeleteConfirmationComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<
      DeleteConfirmationComponent,
      undefined | true
    >,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationData
  ) {}

  ngOnInit(): void {}
}
