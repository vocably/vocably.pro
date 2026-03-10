import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { translations } from './i18n/translations';
import { Locale } from '@vocably/model';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly locale$ = new BehaviorSubject<Locale>('en');

  setLocale(locale: Locale) {
    this.locale$.next(locale);
  }

  getLocale(): Locale {
    return this.locale$.getValue();
  }

  t(key: keyof (typeof translations)['en']): string {
    const locale = this.locale$.getValue();
    const localeTranslations =
      (translations as any)[locale] ?? translations['en'];
    return (
      localeTranslations[key] ?? (translations['en'] as any)[key] ?? String(key)
    );
  }
}
