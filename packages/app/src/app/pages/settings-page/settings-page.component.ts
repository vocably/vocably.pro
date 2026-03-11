import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { RouterLink } from '@angular/router';
import { Auth } from '@aws-amplify/auth';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { saveUserMetadata } from '@vocably/api';
import { Locale } from '@vocably/model';
import { LoaderService } from '../../components/loader.service';
import { HeaderComponent } from '../../header/header.component';
import { DeleteAccountConfirmationComponent } from './delete-account-confirmation/delete-account-confirmation.component';
import {
  getStudySettings,
  setStudySettings,
  StudySettings,
} from '../../../study-settings';
import { AppQrCodeComponent } from '../../components/app-qr-code/app-qr-code.component';
import { StudyStepsComponent } from './study-steps/study-steps.component';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  imports: [
    HeaderComponent,
    IonicModule,
    RouterLink,
    MatDivider,
    MatIcon,
    MatSliderModule,
    MatCheckboxModule,
    FormsModule,
    AppQrCodeComponent,
    StudyStepsComponent,
    TranslocoModule,
  ],
})
export class SettingsPageComponent implements OnInit {
  studySettings: StudySettings = { cardsPerSession: 10, random: false };
  interfaceLanguage: Locale = 'en';

  readonly languages: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'uk', label: 'Українська' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'vi', label: 'Tiếng Việt' },
  ];

  constructor(
    public dialog: MatDialog,
    public loader: LoaderService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.studySettings = getStudySettings();
    this.interfaceLanguage = this.transloco.getActiveLang() as Locale;
  }

  async onInterfaceLanguageChange(locale: Locale): Promise<void> {
    this.transloco.setActiveLang(locale);
    await saveUserMetadata({ interfaceLanguage: locale });
  }

  onStudySettingsChange() {
    setStudySettings(this.studySettings);
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(DeleteAccountConfirmationComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result !== true) {
        return;
      }

      const loaderRef = this.loader.show({
        message: 'Deleting account...',
      });
      localStorage.removeItem('onboardedLanguages');
      await Auth.deleteUser();
      loaderRef.close();
    });
  }
}
