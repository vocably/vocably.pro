import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { CarouselComponent } from '../../auth/carousel/carousel.component';
import { SignInComponent } from '../../auth/sign-in/sign-in.component';
import { HeaderComponent } from '../../header/header.component';
import { setStats } from '../../stats';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [HeaderComponent, CarouselComponent, SignInComponent],
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  constructor(auth: AuthService, router: Router) {
    setStats({ installedDateIso: new Date().toISOString() });

    auth.isLoggedIn$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(async (isLoggedIn) => {
        setStats({ isLoggedIn });

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
