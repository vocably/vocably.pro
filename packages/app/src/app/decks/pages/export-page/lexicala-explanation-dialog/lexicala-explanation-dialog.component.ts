import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-lexicala-explanation-dialog',
  templateUrl: './lexicala-explanation-dialog.component.html',
  styleUrls: ['./lexicala-explanation-dialog.component.scss'],
  standalone: false,
})
export class LexicalaExplanationDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<void>) {}

  ngOnInit(): void {}
}
