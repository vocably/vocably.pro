import { Component, OnInit } from '@angular/core';
import posthog from 'posthog-js';
import { LogoComponent } from '../../header/logo/logo.component';
import { getStats } from '../../stats';

@Component({
  selector: 'app-uninstall',
  templateUrl: './uninstall.component.html',
  styleUrls: ['./uninstall.component.scss'],
  imports: [LogoComponent],
})
export class UninstallComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    const stats = getStats();

    const numberOfDays = stats?.installedDateIso
      ? Math.floor(
          (Date.now() - new Date(stats.installedDateIso).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : undefined;

    posthog.capture('chrome-uninstalled', {
      ...stats,
      numberOfDays,
    });
  }
}
