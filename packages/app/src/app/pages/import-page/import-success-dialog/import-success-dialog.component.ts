import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GoogleLanguage } from '@vocably/model';

export type ImportSuccessDialogData = {
  language: GoogleLanguage;
};

@Component({
  selector: 'app-import-success-dialog',
  templateUrl: './import-success-dialog.component.html',
  styleUrls: ['./import-success-dialog.component.scss'],
  standalone: false,
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
