import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { sendPublicUserFeedback, sendUserFeedback } from '@vocably/api';
import { firstValueFrom, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../header/header.component';

const containsEmail = (text: string) => text.includes('@');

type FeedbackUser = { isLoggedIn: false } | { isLoggedIn: true; email: string };

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.scss'],
  imports: [
    HeaderComponent,
    NgIf,
    FormsModule,
    IonicModule,
    AsyncPipe,
    TranslocoModule,
    MatIcon,
  ],
})
export class FeedbackPageComponent {
  feedback = '';
  isSubmitting = false;
  success = false;
  lastFeedback = '';
  error = false;
  /** Shown to a guest who tries to send a message without an email in it. */
  noEmailWarning = false;

  user$ = this.authService.isLoggedIn$.pipe(
    switchMap((isLoggedIn) =>
      isLoggedIn
        ? this.authService.userData$.pipe(
            map(
              (userData): FeedbackUser => ({
                isLoggedIn: true,
                email: userData.email,
              })
            )
          )
        : of<FeedbackUser>({ isLoggedIn: false })
    )
  );

  constructor(private authService: AuthService) {}

  onFeedbackChange(feedback: string) {
    this.feedback = feedback;
    if (containsEmail(feedback)) {
      this.noEmailWarning = false;
    }
  }

  public async submitFeedback() {
    if (this.isSubmitting) {
      return;
    }

    const user = await firstValueFrom(this.user$);

    if (!user.isLoggedIn && !containsEmail(this.feedback)) {
      this.success = false;
      this.error = false;
      this.noEmailWarning = true;
      return;
    }

    await this.reallySend(user);
  }

  public async sendAnyway() {
    if (this.isSubmitting) {
      return;
    }

    await this.reallySend(await firstValueFrom(this.user$));
  }

  private async reallySend(user: FeedbackUser) {
    this.success = false;
    this.error = false;
    this.noEmailWarning = false;
    this.isSubmitting = true;

    const res = user.isLoggedIn
      ? await sendUserFeedback({
          feedback: this.feedback,
          metadata: {
            platform: 'web-app',
          },
        })
      : await sendPublicUserFeedback({
          feedback: this.feedback,
          metadata: {
            platform: 'web-app',
            isLoggedIn: false,
          },
        });

    this.isSubmitting = false;

    if (res.success) {
      this.success = true;
      this.lastFeedback = this.feedback;
      this.feedback = '';
    } else {
      this.error = true;
    }
  }
}
