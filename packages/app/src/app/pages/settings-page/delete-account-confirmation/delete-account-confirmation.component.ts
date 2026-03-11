import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-delete-account-confirmation',
  templateUrl: './delete-account-confirmation.component.html',
  styleUrls: ['./delete-account-confirmation.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslocoModule,
  ],
})
export class DeleteAccountConfirmationComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<void>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {}
}
