import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import * as Sentry from '@sentry/angular';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InlineTranslocoLoader } from './i18n/transloco-loader';
import { resolveLocale } from './i18n/resolve-locale';

import { FeedbackPageComponent } from './pages/feedback-page/feedback-page.component';
import { ImportFailureDialogComponent } from './pages/import-page/import-failure-dialog/import-failure-dialog.component';
import { ImportPageComponent } from './pages/import-page/import-page.component';
import { ImportSuccessDialogComponent } from './pages/import-page/import-success-dialog/import-success-dialog.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { DeleteAccountConfirmationComponent } from './pages/settings-page/delete-account-confirmation/delete-account-confirmation.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    IonicModule.forRoot({
      mode: 'md',
      statusTap: true,
    }),
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    NotFoundPageComponent,
    SettingsPageComponent,
    DeleteAccountConfirmationComponent,
    FeedbackPageComponent,
    ImportPageComponent,
    ImportSuccessDialogComponent,
    ImportFailureDialogComponent,
  ],
  providers: [
    provideTransloco({
      config: {
        availableLangs: ['en', 'ru', 'uk', 'vi', 'tr'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: true,
      },
      loader: InlineTranslocoLoader,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (ts: TranslocoService) => async () => {
        const locale = await resolveLocale();
        ts.setActiveLang(locale);
        await firstValueFrom(ts.load(locale));
      },
      deps: [TranslocoService],
      multi: true,
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
