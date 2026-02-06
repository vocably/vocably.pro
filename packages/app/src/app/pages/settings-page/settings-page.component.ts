import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Auth } from '@aws-amplify/auth';
import { LoaderService } from '../../components/loader.service';
import { DeleteAccountConfirmationComponent } from './delete-account-confirmation/delete-account-confirmation.component';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  standalone: false,
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
