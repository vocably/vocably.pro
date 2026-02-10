import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-failure-dialog',
  templateUrl: './import-failure-dialog.component.html',
  styleUrls: ['./import-failure-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    MatIcon,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
  ],
})
export class ImportFailureDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ImportFailureDialogComponent>,
    public router: Router
  ) {}

  ngOnInit(): void {}
}
