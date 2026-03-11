import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
  imports: [IonicModule, RouterLink, MatIcon, NgIf, TranslocoModule],
})
export class BackButtonComponent implements OnInit {
  @Input() label = true;

  constructor(public route: ActivatedRoute) {}

  ngOnInit(): void {}

  get relativeTo(): ActivatedRoute {
    let route: ActivatedRoute = this.route;

    while (route.firstChild !== null) {
      route = route.firstChild;
    }

    return route;
  }
}
