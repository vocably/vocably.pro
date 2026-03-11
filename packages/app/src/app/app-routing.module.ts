import { Injectable, NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  NavigationEnd,
  Router,
  RouterModule,
  RouterStateSnapshot,
  Routes,
  TitleStrategy,
} from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import posthog from 'posthog-js';
import {
  autoSignInConfirmationPath,
  manualSignInConfirmationPath,
} from '../auth-config';

import { CognitoAuthGuard } from './auth/cognito-auth.guard';
import { AutoSignInSuccessPageComponent } from './auth/pages/auto-sign-in-success-page/auto-sign-in-success-page.component';
import { HandsFreePageComponent } from './auth/pages/hands-free-page/hands-free-page.component';
import { ManualSignInSuccessPageComponent } from './auth/pages/manual-sign-in-success-page/manual-sign-in-success-page.component';
import { SignInPageComponent } from './auth/pages/sign-in-page/sign-in-page.component';
import { SignOutPageComponent } from './auth/pages/sign-out-page/sign-out-page.component';
import { FeedbackPageComponent } from './pages/feedback-page/feedback-page.component';
import { ImportPageComponent } from './pages/import-page/import-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { PreviewStudyStepPageComponent } from './pages/preview-study-step-page/preview-study-step-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';

export const autoSignInPath = 'hands-free';

@Injectable()
export class TemplatePageTitleStrategy extends TitleStrategy {
  constructor(
    private readonly title: Title,
    private readonly transloco: TranslocoService
  ) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const titleKey = this.buildTitle(routerState);
    if (titleKey !== undefined) {
      const translatedTitle = this.transloco.translate(titleKey);
      this.title.setTitle(`Vocably | ${translatedTitle}`);
    } else {
      this.title.setTitle('Vocably');
    }
  }
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'deck',
  },
  {
    path: 'deck',
    loadChildren: () =>
      import('./decks/decks.module').then((m) => m.DecksModule),
    canActivate: [CognitoAuthGuard],
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./welcome/welcome.module').then((m) => m.WelcomeModule),
    canActivate: [CognitoAuthGuard],
  },
  {
    path: 'subscribe',
    loadChildren: () =>
      import('./subscription/subscription.module').then(
        (m) => m.SubscriptionModule
      ),
    canActivate: [CognitoAuthGuard],
  },
  {
    path: 'membership',
    loadChildren: () =>
      import('./membership/membership.module').then((m) => m.MembershipModule),
    canActivate: [CognitoAuthGuard],
  },
  {
    path: 'page',
    loadChildren: () =>
      import('./static-pages/static-pages.module').then(
        (m) => m.StaticPagesModule
      ),
  },
  {
    path: 'sign-in',
    title: 'page.sign_in',
    component: SignInPageComponent,
  },
  {
    path: autoSignInPath,
    title: 'page.auto_sign_in',
    component: HandsFreePageComponent,
  },
  {
    path: autoSignInConfirmationPath,
    component: AutoSignInSuccessPageComponent,
  },
  {
    path: manualSignInConfirmationPath,
    component: ManualSignInSuccessPageComponent,
  },
  {
    path: 'sign-out',
    component: SignOutPageComponent,
  },
  {
    path: 'settings/preview-study-step',
    title: 'page.preview_study_step',
    component: PreviewStudyStepPageComponent,
    canActivate: [CognitoAuthGuard],
  },
  {
    path: 'settings',
    title: 'page.settings',
    component: SettingsPageComponent,
    canActivate: [CognitoAuthGuard],
  },
  {
    path: 'feedback',
    title: 'page.feedback',
    component: FeedbackPageComponent,
    canActivate: [CognitoAuthGuard],
  },
  {
    path: 'import',
    title: 'page.import_cards',
    component: ImportPageComponent,
    canActivate: [CognitoAuthGuard],
  },
  { path: '**', pathMatch: 'full', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: TemplatePageTitleStrategy }],
})
export class AppRoutingModule {
  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        posthog.capture('$pageview');
      }
    });
  }
}
