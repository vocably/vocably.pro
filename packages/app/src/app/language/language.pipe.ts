import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { languageTranslations } from '@vocably/i18n';
import { Locale } from '@vocably/model';

@Pipe({ name: 'language', pure: false, standalone: true })
export class LanguagePipe implements PipeTransform, OnDestroy {
  private sub: Subscription;

  constructor(
    private transloco: TranslocoService,
    private cdr: ChangeDetectorRef
  ) {
    this.sub = transloco.langChanges$.subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  transform(code: string): string {
    const locale = this.transloco.getActiveLang() as Locale;
    const dict = languageTranslations[locale] ?? languageTranslations['en'];
    return dict[`nominative_${code}`] ?? code;
  }
}
