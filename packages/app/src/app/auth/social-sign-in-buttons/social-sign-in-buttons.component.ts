import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';
import { GoogleIconComponent } from '../../components/google-icon/google-icon.component';
import { AuthService, SocialProvider } from '../auth.service';

@Component({
  selector: 'app-social-sign-in-buttons',
  templateUrl: './social-sign-in-buttons.component.html',
  styleUrls: ['./social-sign-in-buttons.component.scss'],
  imports: [NgIf, IonicModule, TranslocoModule, GoogleIconComponent],
})
export class SocialSignInButtonsComponent {
  public redirectingTo: SocialProvider | null = null;

  constructor(private auth: AuthService) {}

  async signIn(provider: SocialProvider) {
    this.redirectingTo = provider;

    try {
      await this.auth.signInWithProvider(provider);
    } finally {
      // Only reached when the redirect did not happen, e.g. the user came
      // back with the browser's back button.
      this.redirectingTo = null;
    }
  }
}
