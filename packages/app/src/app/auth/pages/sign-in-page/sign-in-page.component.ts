import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { CarouselComponent } from '../../carousel/carousel.component';
import { SignInComponent } from '../../sign-in/sign-in.component';

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss'],
  imports: [HeaderComponent, CarouselComponent, SignInComponent],
})
export class SignInPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
