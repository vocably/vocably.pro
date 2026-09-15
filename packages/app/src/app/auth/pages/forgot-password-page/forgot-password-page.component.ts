import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { HeaderComponent } from '../../../header/header.component';
import { AuthService } from '../../auth.service';
import { authErrorKey } from '../../authErrorKey';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['../../auth-form.scss'],
  imports: [
    NgIf,
    FormsModule,
    RouterLink,
    IonicModule,
    TranslocoModule,
    HeaderComponent,
  ],
})
export class ForgotPasswordPageComponent implements OnInit {
  public email = '';
  public isSubmitting = false;
  public error: AuthErrorCode | null = null;
  public authErrorKey = authErrorKey;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get canSubmit(): boolean {
    return isValidEmail(this.email);
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
      // Succeeds for unknown addresses too: the app client hides whether an
      // account exists.
      await this.auth.requestPasswordReset(this.email);
      await this.router.navigate(['/reset-password'], {
        queryParams: { email: normalizeEmail(this.email) },
      });
    } catch (error) {
      this.error = getAuthErrorCode(error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
