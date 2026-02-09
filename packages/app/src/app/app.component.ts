import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { Platform } from '@ionic/angular';
import { getPaddleInstance } from '@paddle/paddle-js';
import * as Sentry from '@sentry/browser';
import * as PullToRefresh from 'pulltorefreshjs';
import { distinct, firstValueFrom, map } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { RefreshService } from './refresh.service';
import { RouterParamsService } from './router-params.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  disabledRefresher = false;

  constructor(
    routerParams: RouterParamsService,
    private refreshService: RefreshService,
    public platform: Platform,
    private auth: AuthService,
    iconRegistry: MatIconRegistry
  ) {
    iconRegistry.registerFontClassAlias('material-symbols-outlined');
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    routerParams.data$.subscribe((data) => {
      this.disabledRefresher = data['disabledRefresher'] ?? false;
    });

    this.auth.userData$
      .pipe(
        map((data) => data.email),
        distinct()
      )
      .subscribe((email) => {
        Sentry.setUser({ email });

        const paddle = getPaddleInstance();

        if (paddle) {
          paddle.Update({
            pwCustomer: {
              email: email,
              id: email,
            },
          });
        }
      });
  }

  ngOnInit() {
    PullToRefresh.init({
      mainElement: 'body',
      onRefresh: () => {
        this.refreshService.refresh$.next(null);
        return firstValueFrom(this.refreshService.isRefreshed$);
      },
      shouldPullToRefresh: () =>
        this.platform.is('pwa') &&
        !this.disabledRefresher &&
        window.scrollY === 0,
    });
  }
}
