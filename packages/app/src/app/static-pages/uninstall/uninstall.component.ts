import { Component, OnInit } from '@angular/core';
import posthog from 'posthog-js';
import { LogoComponent } from '../../header/logo/logo.component';

@Component({
  selector: 'app-uninstall',
  templateUrl: './uninstall.component.html',
  styleUrls: ['./uninstall.component.scss'],
  imports: [LogoComponent],
})
export class UninstallComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    const userSub = localStorage.getItem('userSub');
    const userEmail = localStorage.getItem('userEmail');

    if (userSub && userEmail) {
      posthog.identify(userSub, { email: userEmail });
    }
  }
}
