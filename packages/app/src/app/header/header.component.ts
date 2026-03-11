import { NgIf } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LogoComponent } from './logo/logo.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    NgIf,
    IonicModule,
    RouterLink,
    LogoComponent,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatDivider,
    TranslocoModule,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  @Input() title: string = '';
  @Input() dense = false;

  isLoggedIn: boolean | null = null;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.auth.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  async signOut() {
    await this.auth.signOut();
  }

  isExpired(date: Date | undefined): boolean {
    if (date === undefined) {
      return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return today.getTime() > date.getTime();
  }
}
