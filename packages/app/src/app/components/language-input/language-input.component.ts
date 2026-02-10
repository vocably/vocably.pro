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
import { GoogleLanguage, languageList } from '@vocably/model';
import { map, Observable, startWith, Subject } from 'rxjs';

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
  ],
})
export class LanguageInputComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject();

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
        this._filterLanguages(this.languageInput.pristine ? '' : value ?? '')
      )
    );

  ngOnInit(): void {}

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

  private _filterLanguages(value: string): GoogleLanguage[] {
    const loweredValue = value.toLowerCase();
    return Object.entries(languageList)
      .filter(
        ([languageCode, languageName]) =>
          languageCode.toLowerCase().includes(loweredValue) ||
          languageName.toLowerCase().includes(loweredValue)
      )
      .map(([code]) => code as GoogleLanguage);
  }

  displayLanguage(languageCode: GoogleLanguage): string {
    return languageCode ? languageList[languageCode] : '';
  }

  onLanguageInputFocus(event: any) {
    if (this.languageInput.pristine) {
      event.target.select();
    }
  }
}
