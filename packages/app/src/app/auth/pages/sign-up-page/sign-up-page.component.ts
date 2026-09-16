import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';
import {
  AuthErrorCode,
  getAuthErrorCode,
  isPasswordValid,
  isValidEmail,
  normalizeEmail,
} from '@vocably/sulna';
import { environment } from '../../../../environments/environment';
import { HeaderComponent } from '../../../header/header.component';
import { AuthService } from '../../auth.service';
import { authErrorKey } from '../../authErrorKey';
import { PasswordRequirementsComponent } from '../../password-requirements/password-requirements.component';
import { SocialSignInButtonsComponent } from '../../social-sign-in-buttons/social-sign-in-buttons.component';
import { CarouselComponent } from '../../carousel/carousel.component';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['../../auth-form.scss'],
  imports: [
    NgIf,
    FormsModule,
    RouterLink,
    IonicModule,
    TranslocoModule,
    HeaderComponent,
    SocialSignInButtonsComponent,
    PasswordRequirementsComponent,
    CarouselComponent,
  ],
})
export class SignUpPageComponent implements OnInit {
  public wwwBaseUrl = environment.wwwBaseUrl;
  public emailPasswordEnabled = environment.auth.emailPasswordAuthEnabled;

  public email = '';
  public password = '';
  public showPassword = false;
  public emailTouched = false;
  public isSubmitting = false;
  public error: AuthErrorCode | null = null;
  public authErrorKey = authErrorKey;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get isEmailInvalid(): boolean {
    return this.emailTouched && !isValidEmail(this.email);
  }

  get canSubmit(): boolean {
    return isValidEmail(this.email) && isPasswordValid(this.password);
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  async submit() {
    if (!this.canSubmit || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    try {
      const step = await this.auth.signUpWithEmail(this.email, this.password);

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
}
