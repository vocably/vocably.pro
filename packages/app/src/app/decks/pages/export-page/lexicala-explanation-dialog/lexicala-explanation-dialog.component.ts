import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-lexicala-explanation-dialog',
  templateUrl: './lexicala-explanation-dialog.component.html',
  styleUrls: ['./lexicala-explanation-dialog.component.scss'],
  imports: [CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class LexicalaExplanationDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<void>) {}

  ngOnInit(): void {}
}
