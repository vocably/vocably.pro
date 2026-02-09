import { Component, OnInit } from '@angular/core';
import { ExtensionSettings } from '@vocably/extension-messages';
import { ReplaySubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  standalone: false,
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
