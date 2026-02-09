import { Component, OnInit } from '@angular/core';
import { sendUserFeedback } from '@vocably/api';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.scss'],
  standalone: false,
})
export class FeedbackPageComponent implements OnInit {
  feedback = '';
  isSubmitting = false;
  success = false;
  lastFeedback = '';
  error = false;

  userData$ = this.authService.fetchUserData$;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  public async submitFeedback() {
    if (this.isSubmitting) {
      return;
    }

    this.success = false;
    this.error = false;
    this.isSubmitting = true;

    const res = await sendUserFeedback({
      feedback: this.feedback,
      metadata: {
        platform: 'web-app',
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
