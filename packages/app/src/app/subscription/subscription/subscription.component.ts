import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
  imports: [HeaderComponent, RouterOutlet],
})
export class SubscriptionComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
