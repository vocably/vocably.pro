import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';
import {
  AuthErrorCode,
  getAuthErrorCode,
  isPasswordValid,
} from '@vocably/sulna';
import { HeaderComponent } from '../../../header/header.component';
import { AuthService } from '../../auth.service';
import { authErrorKey } from '../../authErrorKey';
import { PasswordRequirementsComponent } from '../../password-requirements/password-requirements.component';
import { ResendCooldown } from '../../resendCooldown';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['../../auth-form.scss'],
  imports: [
    NgIf,
    FormsModule,
    RouterLink,
    IonicModule,
    TranslocoModule,
    HeaderComponent,
    PasswordRequirementsComponent,
  ],
})
export class ResetPasswordPageComponent implements OnInit, OnDestroy {
  public email = '';
  public code = '';
  public password = '';
  public showPassword = false;
  public isSubmitting = false;
  public isResending = false;
  public error: AuthErrorCode | null = null;
  public notice: string | null = null;
  public cooldown = new ResendCooldown();
  public authErrorKey = authErrorKey;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get canSubmit(): boolean {
    return /^\d{6}$/.test(this.code.trim()) && isPasswordValid(this.password);
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    if (!this.email) {
      this.router.navigate(['/forgot-password'], { replaceUrl: true });
      return;
    }

    this.cooldown.start();
  }

  async submit() {
    if (!this.canSubmit || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.notice = null;

    try {
      const step = await this.auth.confirmPasswordReset(
        this.email,
        this.code,
        this.password
      );

      if (step === 'confirmSignUp') {
        await this.router.navigate(['/verify-email'], {
          queryParams: { email: this.email },
          replaceUrl: true,
        });
      }
    } catch (error) {
      this.error = getAuthErrorCode(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async resend() {
    if (this.cooldown.seconds > 0 || this.isResending) {
      return;
    }

    this.isResending = true;
    this.error = null;
    this.notice = null;

    try {
      await this.auth.requestPasswordReset(this.email);
      this.notice = 'auth.verify.resent';
      this.cooldown.start();
    } catch (error) {
      this.error = getAuthErrorCode(error);
    } finally {
      this.isResending = false;
    }
  }

  ngOnDestroy(): void {
    this.cooldown.stop();
  }
}
