import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { environment } from '../environments/environment';
import { isUserLoggedIn$ } from '../isUserLoggedIn';
import { setStencilLocale } from './setStencilLocale';
import { TranslationService } from './translation.service';

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
      const locale = settings.locale ?? 'en';
      this.ts.setLocale(locale);
      setStencilLocale(locale);
    });

    isUserLoggedIn$.subscribe((isUserLoggedIn) => {
      this.isLoggedIn = isUserLoggedIn ? 'yes' : 'no';
    });
  }
}
