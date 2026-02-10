import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Auth } from '@aws-amplify/auth';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from '../../components/loader.service';
import { HeaderComponent } from '../../header/header.component';
import { DeleteAccountConfirmationComponent } from './delete-account-confirmation/delete-account-confirmation.component';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  imports: [HeaderComponent, IonicModule, RouterLink, MatDivider, MatIcon],
})
export class SettingsPageComponent implements OnInit {
  constructor(public dialog: MatDialog, public loader: LoaderService) {}

  ngOnInit(): void {}

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
