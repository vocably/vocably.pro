import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { deleteUser } from 'aws-amplify/auth';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { saveUserMetadata } from '@vocably/api';
import { Locale } from '@vocably/model';
import { firstValueFrom, map } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { LoaderService } from '../../components/loader.service';
import { HeaderComponent } from '../../header/header.component';
import {
  DeleteAccountConfirmationComponent,
  DeleteAccountConfirmationData,
} from './delete-account-confirmation/delete-account-confirmation.component';
import {
  getStudySettings,
  setStudySettings,
  StudySettings,
} from '../../../study-settings';
import { AppQrCodeComponent } from '../../components/app-qr-code/app-qr-code.component';
import { StudyStepsComponent } from './study-steps/study-steps.component';
import { storeLocale } from '../../i18n/resolve-locale';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  imports: [
    HeaderComponent,
    IonicModule,
    RouterLink,
    MatIcon,
    MatSliderModule,
    MatSlideToggle,
    MatSelectModule,
    FormsModule,
    AppQrCodeComponent,
    StudyStepsComponent,
    TranslocoModule,
    AsyncPipe,
  ],
})
export class SettingsPageComponent implements OnInit {
  studySettings: StudySettings = { cardsPerSession: 10, random: false };
  interfaceLanguage: Locale = 'en';
  isLoggedIn$ = this.auth.isLoggedIn$;
  email$ = this.auth.userData$.pipe(map((userData) => userData.email));

  readonly languages: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'uk', label: 'Українська' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'vi', label: 'Tiếng Việt' },
  ];

  constructor(
    public dialog: MatDialog,
    public loader: LoaderService,
    private transloco: TranslocoService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.studySettings = getStudySettings();
    this.interfaceLanguage = this.transloco.getActiveLang() as Locale;
  }

  async onInterfaceLanguageChange(locale: Locale): Promise<void> {
    this.transloco.setActiveLang(locale);
    storeLocale(locale);

    if (await firstValueFrom(this.isLoggedIn$)) {
      await saveUserMetadata({ interfaceLanguage: locale });
    }
  }

  onStudySettingsChange() {
    setStudySettings(this.studySettings);
  }

  async deleteAccount() {
    const data: DeleteAccountConfirmationData = {
      email: await firstValueFrom(this.email$),
    };
    const dialogRef = this.dialog.open(DeleteAccountConfirmationComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result !== true) {
        return;
      }

      const loaderRef = this.loader.show({
        message: 'Deleting account...',
      });
      localStorage.removeItem('onboardedLanguages');
      await deleteUser();
      loaderRef.close();
    });
  }
}
