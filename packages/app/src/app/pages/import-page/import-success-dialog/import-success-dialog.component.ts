import { Component, Inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { GoogleLanguage } from '@vocably/model';

export type ImportSuccessDialogData = {
  language: GoogleLanguage;
};

@Component({
  selector: 'app-import-success-dialog',
  templateUrl: './import-success-dialog.component.html',
  styleUrls: ['./import-success-dialog.component.scss'],
  imports: [MatDialogTitle, MatDialogActions, MatButton, TranslocoModule],
})
export class ImportSuccessDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<
      ImportSuccessDialogComponent,
      undefined | 'import-more'
    >,
    @Inject(MAT_DIALOG_DATA) public data: ImportSuccessDialogData,
    public router: Router
  ) {}

  ngOnInit(): void {}

  goToDeck() {
    this.router.navigate([`/deck/${this.data.language}`]);
  }
}
