import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-lexicala-explanation-dialog',
  templateUrl: './lexicala-explanation-dialog.component.html',
  styleUrls: ['./lexicala-explanation-dialog.component.scss'],
  imports: [
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    TranslocoModule,
  ],
})
export class LexicalaExplanationDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<void>) {}

  ngOnInit(): void {}
}
