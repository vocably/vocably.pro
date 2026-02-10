import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { AppQrCodeComponent } from '../../../../components/app-qr-code/app-qr-code.component';

@Component({
  selector: 'app-mobile-app-encourager',
  templateUrl: './mobile-app-encourager.component.html',
  styleUrls: ['./mobile-app-encourager.component.scss'],
  imports: [
    CdkScrollable,
    MatDialogContent,
    AppQrCodeComponent,
    MatDialogActions,
    MatDialogClose,
  ],
})
export class MobileAppEncouragerComponent implements OnInit {
  loaded = true;

  constructor(public dialogRef: MatDialogRef<void>) {}

  ngOnInit(): void {}
}
