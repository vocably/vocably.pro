import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { SignInComponent } from '../../sign-in/sign-in.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss'],
  imports: [HeaderComponent, SignInComponent, TranslocoPipe],
})
export class SignInPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
