import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-how-to-multilang',
  templateUrl: './how-to-multilang.component.html',
  styleUrls: ['./how-to-multilang.component.scss'],
  imports: [
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    TranslocoModule,
  ],
})
export class HowToMultilangComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
