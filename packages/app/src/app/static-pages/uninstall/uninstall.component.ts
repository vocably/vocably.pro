import { Component, OnInit } from '@angular/core';
import posthog from 'posthog-js';

@Component({
  selector: 'app-uninstall',
  templateUrl: './uninstall.component.html',
  styleUrls: ['./uninstall.component.scss'],
  standalone: false,
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
