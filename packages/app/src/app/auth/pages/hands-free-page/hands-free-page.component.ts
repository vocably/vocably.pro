import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { filter } from 'rxjs/operators';
import { browserType } from '../../../../browser';
import { ExpansionComponent } from '../../../components/expansion/expansion.component';
import { HeaderComponent } from '../../../header/header.component';
import { isExtensionInstalled$ } from '../../../isExtensionInstalled';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-hands-free-page',
  templateUrl: './hands-free-page.component.html',
  styleUrls: ['./hands-free-page.component.scss'],
  imports: [HeaderComponent, NgIf, ExpansionComponent, IonicModule],
})
export class HandsFreePageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public isInstalled: boolean | undefined = undefined;
  public browserType = browserType;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    isExtensionInstalled$
      .pipe(
        takeUntil(this.destroy$),
        tap((isInstalled) => {
          this.isInstalled = isInstalled;
        }),
        filter((isInstalled) => isInstalled === true),
        take(1),
        switchMap(() => this.auth.isLoggedIn$)
      )
      .subscribe(async (isLoggedIn) => {
        if (isLoggedIn) {
          await this.auth.refreshToken();
          this.router.navigate(['/signed-in'], { replaceUrl: true });
        } else {
          this.auth.signIn();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
