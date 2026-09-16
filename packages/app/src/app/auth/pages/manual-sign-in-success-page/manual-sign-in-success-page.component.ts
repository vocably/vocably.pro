import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { from, Subject, takeUntil } from 'rxjs';
import { HeaderComponent } from '../../../header/header.component';
import { AuthService } from '../../auth.service';
import {
  clearIntendedDestination,
  getIntendedDestination,
} from '../../intendedDestination';
import {
  destinationForRedirectError,
  redirectError$,
  redirectErrorFromParams,
} from '../../redirectError';

@Component({
  selector: 'app-mnual-sign-in-success-page',
  templateUrl: './manual-sign-in-success-page.component.html',
  styleUrls: ['./manual-sign-in-success-page.component.scss'],
  imports: [HeaderComponent, NgIf, IonicModule, TranslocoModule],
})
export class ManualSignInSuccessPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public isLoading = true;
  public isRedirecting = false;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * A refused sign-in never produces a session, so the page would otherwise
   * sit on its spinner waiting for one.
   */
  private redirectFailedSignIn(): boolean {
    const code = redirectErrorFromParams(this.route.snapshot.queryParamMap);

    if (code === null) {
      return false;
    }

    // As in the Hub listener: a sign-in the user called off is not an error.
    if (code !== 'cancelled') {
      redirectError$.next(code);
    }

    this.router.navigate([destinationForRedirectError(code)], {
      replaceUrl: true,
    });

    return true;
  }

  ngOnInit(): void {
    if (this.redirectFailedSignIn()) {
      return;
    }

    from(this.auth.isLoggedIn$)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        this.isLoading = false;
        const intendedDestination = getIntendedDestination();

        this.isRedirecting = true;

        if (isLoggedIn && intendedDestination) {
          clearIntendedDestination();
          window.location.href = intendedDestination;
          return;
        }

        if (isLoggedIn) {
          this.router.navigate(['/']);
          return;
        }

        this.router.navigate(['/sign-in']);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
