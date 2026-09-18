import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { from, Subject, takeUntil } from 'rxjs';
import { HeaderComponent } from '../../../header/header.component';
import { AuthService } from '../../auth.service';
import { clearIntendedDestination } from '../../intendedDestination';
import {
  destinationForRedirectError,
  redirectError$,
  redirectErrorFromParams,
} from '../../redirectError';

@Component({
  selector: 'app-auto-sign-in-success-page',
  templateUrl: './auto-sign-in-success-page.component.html',
  styleUrls: ['./auto-sign-in-success-page.component.scss'],
  imports: [HeaderComponent, NgIf, IonicModule, TranslocoModule],
})
export class AutoSignInSuccessPageComponent implements OnInit {
  private destroy$ = new Subject();

  public isLoading = true;

  public canBeAutomaticallyClosed = !!window.opener;

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
        if (!isLoggedIn) {
          // A failed Google/Apple redirect lands here too; the sign-in page
          // shows why.
          this.router.navigate(['/sign-in'], { replaceUrl: true });
          return;
        }

        this.isLoading = false;
        clearIntendedDestination();
      });
  }

  closeTheTab() {
    window.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
