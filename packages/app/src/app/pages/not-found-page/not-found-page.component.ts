import { Component, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss'],
  imports: [HeaderComponent, TranslocoModule],
})
export class NotFoundPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
