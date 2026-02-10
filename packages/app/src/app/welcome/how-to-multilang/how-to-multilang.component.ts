import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';

@Component({
  selector: 'app-how-to-multilang',
  templateUrl: './how-to-multilang.component.html',
  styleUrls: ['./how-to-multilang.component.scss'],
  imports: [CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class HowToMultilangComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
