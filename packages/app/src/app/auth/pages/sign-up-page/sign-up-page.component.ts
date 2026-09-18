import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderComponent } from '../../../header/header.component';
import { isExtensionInstalled$ } from '../../../isExtensionInstalled';
import { AuthService } from '../../auth.service';
import { authErrorKey } from '../../authErrorKey';
import { redirectError$ } from '../../redirectError';
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
export class SignUpPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject();

  @ViewChild('formAnchor') formAnchor?: ElementRef<HTMLElement>;

  public wwwBaseUrl = environment.wwwBaseUrl;

  public email = '';
  public password = '';
  public showPassword = false;
  public emailTouched = false;
  public isSubmitting = false;
  // A failed Google/Apple sign-up belongs above the social buttons, an
  // email + password failure above the submit button.
  public socialError: AuthErrorCode | null = null;
  public formError: AuthErrorCode | null = null;
  public authErrorKey = authErrorKey;
  // Undefined until the first ping answers, so the carousel doesn't flash on
  // a page the extension isn't installed for.
  public isExtensionInstalled: boolean | undefined = undefined;

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

    // A Google/Apple sign-in the pre sign-up trigger refused is redirected
    // here, and the reason travels with it.
    redirectError$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
      this.socialError = code;
    });

    isExtensionInstalled$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isInstalled) => {
        this.isExtensionInstalled = isInstalled;
      });
  }

  ngAfterViewInit(): void {
    // The sign in page links here with #form when the visitor asked for the
    // sign up form, which otherwise sits below the carousel, out of sight.
    if (this.route.snapshot.fragment !== 'form') {
      return;
    }

    setTimeout(() =>
      this.formAnchor?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    );
  }

  async submit() {
    if (!this.canSubmit || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.formError = null;
    redirectError$.next(null);

    try {
      const step = await this.auth.signUpWithEmail(this.email, this.password);

      if (step === 'confirmSignUp') {
        await this.router.navigate(['/verify-email'], {
          queryParams: { email: normalizeEmail(this.email) },
        });
      }
    } catch (error) {
      this.formError = getAuthErrorCode(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
