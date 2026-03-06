import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { environment } from '../environments/environment';
import { isUserLoggedIn$ } from '../isUserLoggedIn';
import { TranslationService } from './translation.service';
import { detectLocale, setLocale } from '@vocably/browser-i18n';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  loginUrl = `${environment.appBaseUrl}/page/welcome`;

  isLoggedIn: 'yes' | 'no' | 'undefined' = 'undefined';

  constructor(
    iconRegistry: MatIconRegistry,
    private ts: TranslationService
  ) {
    iconRegistry.registerFontClassAlias('material-symbols-outlined');
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }

  ngOnInit() {
    environment.getSettings().then((settings) => {
      const locale = settings.locale ?? detectLocale();
      this.ts.setLocale(locale);
      setLocale(locale);
    });

    isUserLoggedIn$.subscribe((isUserLoggedIn) => {
      this.isLoggedIn = isUserLoggedIn ? 'yes' : 'no';
    });
  }
}
