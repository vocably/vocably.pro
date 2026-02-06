import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-failure-dialog',
  templateUrl: './import-failure-dialog.component.html',
  styleUrls: ['./import-failure-dialog.component.scss'],
  standalone: false,
})
export class ImportFailureDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ImportFailureDialogComponent>,
    public router: Router
  ) {}

  ngOnInit(): void {}
}
