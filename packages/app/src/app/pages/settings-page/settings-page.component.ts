import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { RouterLink } from '@angular/router';
import { Auth } from '@aws-amplify/auth';
import { IonicModule } from '@ionic/angular';
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
  ],
})
export class SettingsPageComponent implements OnInit {
  studySettings: StudySettings = { cardsPerSession: 10, random: false };

  constructor(
    public dialog: MatDialog,
    public loader: LoaderService
  ) {}

  ngOnInit(): void {
    this.studySettings = getStudySettings();
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
