import { AsyncPipe, NgFor } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslocoService } from '@jsverse/transloco';
import { languageTranslations } from '@vocably/browser-i18n';
import { GoogleLanguage, Locale, languageList } from '@vocably/model';
import { map, Observable, startWith, Subject } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-language-input',
  templateUrl: './language-input.component.html',
  styleUrls: ['./language-input.component.scss'],
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
    NgFor,
    MatOption,
    AsyncPipe,
    MatIcon,
  ],
})
export class LanguageInputComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject();

  constructor(private transloco: TranslocoService) {}

  @Input() value: GoogleLanguage | '' = 'en';
  @Output() onChange = new EventEmitter<GoogleLanguage>();

  languageInput = new FormControl<GoogleLanguage | ''>({
    value: this.value,
    disabled: false,
  });

  public languages$: Observable<GoogleLanguage[]> =
    this.languageInput.valueChanges.pipe(
      startWith(''),
      map((value) =>
        this._filterLanguages(this.languageInput.pristine ? '' : (value ?? ''))
      )
    );

  public sortedLanguages: GoogleLanguage[] = [];

  ngOnInit(): void {
    this.sortedLanguages = (Object.keys(languageList) as GoogleLanguage[]).sort(
      (codeA, codeB) => {
        return this.displayLanguage(codeA).localeCompare(
          this.displayLanguage(codeB)
        );
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['value']) {
      return;
    }

    if (changes['value'].currentValue !== changes['value'].previousValue) {
      this.languageInput.setValue(changes['value'].currentValue);
    }
  }

  private _getTranslatedName(languageCode: string): string {
    const locale = this.transloco.getActiveLang() as Locale;
    const dict = languageTranslations[locale] ?? languageTranslations['en'];
    return (
      dict[`nominative_${languageCode}`] ??
      languageList[languageCode as GoogleLanguage] ??
      languageCode
    );
  }

  private _filterLanguages(value: string): GoogleLanguage[] {
    const loweredValue = value.toLowerCase();
    return this.sortedLanguages
      .filter(
        (languageCode) =>
          languageCode.toLowerCase().includes(loweredValue) ||
          this._getTranslatedName(languageCode)
            .toLowerCase()
            .includes(loweredValue)
      )
      .map((code) => code as GoogleLanguage);
  }

  displayLanguage = (languageCode: GoogleLanguage): string => {
    return languageCode ? this._getTranslatedName(languageCode) : '';
  };

  onLanguageInputFocus(event: any) {
    if (this.languageInput.pristine) {
      event.target.select();
    }
  }
}
