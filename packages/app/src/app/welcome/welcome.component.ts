import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  canExtensionBeInstalled,
  extensionInstallationUrl,
} from '../../extension';
import { isExtensionInstalled$ } from '../isExtensionInstalled';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  standalone: false,
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
