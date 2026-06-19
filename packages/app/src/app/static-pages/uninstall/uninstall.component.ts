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
    posthog.capture('chrome-uninstalled', getStats());
  }
}
