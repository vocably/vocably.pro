import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslocoModule } from '@jsverse/transloco';

export interface AlertData {
  message: string;
  confirmationButtonLabel: string;
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslocoModule,
  ],
})
export class AlertComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: AlertData) {}
}
