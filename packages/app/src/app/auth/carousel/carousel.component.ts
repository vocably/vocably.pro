import { Component, OnInit } from '@angular/core';
import { isIOS } from '../../../browser';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  standalone: false,
})
export class CarouselComponent implements OnInit {
  isIOS = isIOS();

  constructor() {}

  ngOnInit(): void {}
}
