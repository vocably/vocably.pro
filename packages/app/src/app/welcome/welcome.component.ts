import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import {
  isChrome,
  isDesktop,
  isEdge,
  isIOSSafari,
  isMacSafari,
} from '../../browser';
import {
  canExtensionBeInstalled,
  chromeExtensionInstallationUrl,
  edgeExtensionInstallationUrl,
  extensionInstallationUrl,
} from '../../extension';
import { AppQrCodeComponent } from '../components/app-qr-code/app-qr-code.component';
import { HeaderComponent } from '../header/header.component';
import { isExtensionInstalled$ } from '../isExtensionInstalled';
import { TranslocoModule } from '@jsverse/transloco';
import { ContainerService } from './container-service';
import { setStats } from '../stats';
import { AuthService } from '../auth/auth.service';

type InstallOption = {
  browser: string;
  icon: string;
  url: string;
};

/**
 * Only the stores that fit the current browser. Edge runs the Chrome Web
 * Store build as well, so both stores are offered there.
 */
const getInstallOptions = (): InstallOption[] => {
  const chrome: InstallOption = {
    browser: 'Chrome',
    icon: 'assets/browsers/chrome.svg',
    url: chromeExtensionInstallationUrl,
  };

  if (isIOSSafari || isMacSafari) {
    return [
      {
        browser: 'Safari',
        icon: 'assets/browsers/safari.svg',
        url: extensionInstallationUrl,
      },
    ];
  }

  if (isEdge) {
    return [
      {
        browser: 'Edge',
        icon: 'assets/browsers/edge.svg',
        url: edgeExtensionInstallationUrl,
      },
      chrome,
    ];
  }

  if (isChrome) {
    return [chrome];
  }

  return [];
};

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [
    HeaderComponent,
    NgIf,
    NgFor,
    MatIconModule,
    RouterOutlet,
    TranslocoModule,
    AppQrCodeComponent,
  ],
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public extensionCanBeInstalled = canExtensionBeInstalled;
  public extensionIsInstalled: boolean | undefined = undefined;
  public extensionInstallUrl = extensionInstallationUrl;
  public installOptions = getInstallOptions();
  public mobileAppUrl = 'https://vocably.pro/app.html';
  public isDesktop = isDesktop;
  public size: 'normal' | 'large' = 'normal';

  constructor(
    private containerService: ContainerService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    setStats({ installedDateIso: new Date().toISOString() });

    this.auth.isLoggedIn$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => setStats({ isLoggedIn }));

    isExtensionInstalled$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isInstalled) => {
        // This handles the case where the extension is installed after the page is loaded
        if (this.extensionIsInstalled === false && isInstalled) {
          window.location.reload();
          return;
        }

        this.extensionIsInstalled = isInstalled;
      });

    this.containerService.size
      .pipe(takeUntil(this.destroy$))
      .subscribe((size) => {
        this.size = size;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
