import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  canExtensionBeInstalled,
  extensionInstallationUrl,
} from '../../extension';
import { AppQrCodeComponent } from '../components/app-qr-code/app-qr-code.component';
import { ExpansionComponent } from '../components/expansion/expansion.component';
import { HeaderComponent } from '../header/header.component';
import { isExtensionInstalled$ } from '../isExtensionInstalled';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [
    HeaderComponent,
    NgIf,
    ExpansionComponent,
    AppQrCodeComponent,
    RouterOutlet,
    TranslocoModule,
  ],
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public extensionCanBeInstalled = canExtensionBeInstalled;
  public extensionIsInstalled: boolean | undefined = undefined;
  public extensionInstallUrl = extensionInstallationUrl;

  constructor() {}

  ngOnInit(): void {
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
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
