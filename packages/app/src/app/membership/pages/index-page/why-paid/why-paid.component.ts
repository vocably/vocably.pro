import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { isChrome, isMacSafari } from '../../../../../browser';

type Platform = {
  name: string;
  url: string;
};

const getPlatform = (): Platform | null => {
  if (isChrome) {
    return {
      name: 'Chrome Web Store',
      url: 'https://chrome.google.com/webstore/detail/vocably/baocigmmhhdemijfjnjdidbkfgpgogmb',
    };
  }

  if (isMacSafari) {
    return {
      name: 'App Store',
      url: 'https://apps.apple.com/app/id6464076425',
    };
  }

  return null;
};

@Component({
  selector: 'app-why-paid',
  templateUrl: './why-paid.component.html',
  styleUrls: ['./why-paid.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    NgIf,
    MatDialogActions,
    MatDialogClose,
  ],
})
export class WhyPaidComponent implements OnInit {
  platform: Platform | null = getPlatform();

  constructor() {}

  ngOnInit(): void {}
}
