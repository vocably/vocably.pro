import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';
import {
  AuthErrorCode,
  getAuthErrorCode,
  isValidEmail,
  normalizeEmail,
} from '@vocably/sulna';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';
import { authErrorKey } from '../authErrorKey';
import { redirectError$ } from '../redirectError';
import { SocialSignInButtonsComponent } from '../social-sign-in-buttons/social-sign-in-buttons.component';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['../auth-form.scss', './sign-in.component.scss'],
  imports: [
    NgIf,
    FormsModule,
    RouterLink,
    IonicModule,
    TranslocoModule,
    SocialSignInButtonsComponent,
  ],
})
export class SignInComponent implements OnInit, OnDestroy {
  public wwwBaseUrl = environment.wwwBaseUrl;
  public emailPasswordEnabled = environment.auth.emailPasswordAuthEnabled;

  public email = '';
  public password = '';
  public showPassword = false;
  public isSubmitting = false;
  public error: AuthErrorCode | null = null;
  public notice: string | null = null;
  public authErrorKey = authErrorKey;

  private destroy$ = new Subject();

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get canSubmit(): boolean {
    return isValidEmail(this.email) && this.password.length > 0;
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.email = params.get('email') ?? '';

    if (params.has('confirmed')) {
      this.notice = 'auth.sign_in.email_confirmed';
    }

    redirectError$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
      this.error = code;
    });
  }

  async submit() {
    if (!this.canSubmit || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.notice = null;
    redirectError$.next(null);

    try {
      const step = await this.auth.signInWithEmail(this.email, this.password);

      if (step === 'confirmSignUp') {
        await this.router.navigate(['/verify-email'], {
          queryParams: { email: normalizeEmail(this.email) },
        });
      }
    } catch (error) {
      this.error = getAuthErrorCode(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
