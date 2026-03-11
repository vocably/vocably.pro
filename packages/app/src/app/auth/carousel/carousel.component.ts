import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { isIOS } from '../../../browser';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  imports: [NgIf, TranslocoModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarouselComponent implements OnInit {
  isIOS = isIOS();

  constructor() {}

  ngOnInit(): void {}
}
