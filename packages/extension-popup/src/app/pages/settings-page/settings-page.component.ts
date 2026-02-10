import { AsyncPipe, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ExtensionSettings } from '@vocably/extension-messages';
import { ReplaySubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, RouterLink, MatIcon, NgIf, AsyncPipe],
})
export class SettingsPageComponent implements OnInit {
  showQRCode = false;
  settings$ = new ReplaySubject<ExtensionSettings>();

  constructor() {}

  ngOnInit(): void {
    environment.getSettings().then((settings) => {
      this.settings$.next(settings);
    });
  }

  setSettings(partialSettings: Partial<ExtensionSettings>) {
    environment
      .setSettings(partialSettings)
      .then((settings) => this.settings$.next(settings));
  }
}
