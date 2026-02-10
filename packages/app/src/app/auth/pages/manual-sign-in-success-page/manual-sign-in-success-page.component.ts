import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { from, Subject, takeUntil } from 'rxjs';
import { HeaderComponent } from '../../../header/header.component';
import { AuthService } from '../../auth.service';
import {
  clearIntendedDestination,
  getIntendedDestination,
} from '../../intendedDestination';

@Component({
  selector: 'app-mnual-sign-in-success-page',
  templateUrl: './manual-sign-in-success-page.component.html',
  styleUrls: ['./manual-sign-in-success-page.component.scss'],
  imports: [HeaderComponent, NgIf, IonicModule],
})
export class ManualSignInSuccessPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public isLoading = true;
  public isRedirecting = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
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
