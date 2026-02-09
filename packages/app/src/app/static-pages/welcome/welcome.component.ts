import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  standalone: false,
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  constructor(auth: AuthService, router: Router) {
    auth.isLoggedIn$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(async (isLoggedIn) => {
        if (isLoggedIn) {
          await auth.refreshToken();
          router.navigate(['/'], { replaceUrl: true }).then();
        }
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
