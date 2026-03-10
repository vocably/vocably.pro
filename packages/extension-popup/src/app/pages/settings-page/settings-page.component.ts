import { AsyncPipe, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ExtensionSettings } from '@vocably/extension-messages';
import { ReplaySubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../translate.pipe';
import { TranslationService } from '../../translation.service';
import { setLocale } from '@vocably/browser-i18n';
import { Locale } from '@vocably/model';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, RouterLink, MatIcon, NgIf, AsyncPipe, TranslatePipe],
})
export class SettingsPageComponent implements OnInit {
  showQRCode = false;
  settings$ = new ReplaySubject<ExtensionSettings>();

  constructor(private ts: TranslationService) {}

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

  setLocale(locale: string) {
    const localeValue = locale as Locale;
    setLocale(localeValue);
    console.log('setLocale', localeValue);
    this.ts.setLocale(localeValue);
    environment
      .setSettings({ locale: localeValue })
      .then((settings) => this.settings$.next(settings));
  }
}
