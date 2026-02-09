import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
  standalone: false,
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
