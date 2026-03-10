import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoogleLanguage, isGoogleLanguage } from '@vocably/model';

import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import {
  catchError,
  filter,
  from,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { LogoComponent } from '../../header/logo/logo.component';

@Component({
  selector: 'app-android-translate',
  templateUrl: './android-translate.component.html',
  styleUrls: ['./android-translate.component.scss'],
  imports: [LogoComponent, NgIf, IonicModule, MatIcon, TranslocoModule],
})
export class AndroidTranslateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public isLoading = false;
  public exampleHtml = '';
  public sourceLanguage: GoogleLanguage | undefined;
  public hasNoExample = false;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroy$),
        filter((params: any) => params['sourceLanguage']),
        filter((params) => {
          return isGoogleLanguage(params['sourceLanguage']);
        }),
        tap(() => (this.isLoading = true)),
        tap(async (params) => {
          this.sourceLanguage = params['sourceLanguage'];
        }),
        switchMap((params): Observable<string> => {
          const exampleExists = [
            'af',
            'am',
            'ar',
            'az',
            'be',
            'bg',
            'bn',
            'bs',
            'ca',
            'co',
            'cs',
            'cy',
            'da',
            'de',
            'el',
            'en',
            'eo',
            'es',
            'et',
            'eu',
            'fa',
            'fi',
            'fr',
            'fy',
            'ga',
            'gd',
            'gl',
            'gu',
            'ha',
            'haw',
            'he',
            'hi',
            'hmn',
            'hr',
            'ht',
            'hu',
            'hy',
            'id',
            'ig',
            'is',
            'it',
            'ja',
            'jv',
            'ka',
            'kk',
            'km',
            'kn',
            'ko',
            'ku',
            'ky',
            'lb',
            'lo',
            'lt',
            'lv',
            'mg',
            'mi',
            'mk',
            'ml',
            'mn',
            'mr',
            'ms',
            'mt',
            'my',
            'ne',
            'nl',
            'no',
            'ny',
            'or',
            'pa',
            'pl',
            'ps',
            'pt',
            'ro',
            'ru',
            'rw',
            'sd',
            'si',
            'sk',
            'sl',
            'sm',
            'sn',
            'so',
            'sq',
            'sr',
            'st',
            'su',
            'sv',
            'sw',
            'ta',
            'te',
            'tg',
            'th',
            'tk',
            'tl',
            'tr',
            'tt',
            'ug',
            'uk',
            'ur',
            'uz',
            'vi',
            'xh',
            'yi',
            'yo',
            'zh',
            'zh-TW',
            'zu',
          ].includes(params['sourceLanguage']);

          if (!exampleExists) {
            return throwError(() => new Error('No example available'));
          }

          return from(
            fetch(
              `/assets/language-text-examples/${params['sourceLanguage']}.html`
            ).then((res) => {
              if (!res.ok) {
                throw new Error('No example available');
              }
              return res.text();
            })
          );
        }),
        takeUntil(this.destroy$),
        catchError(() => {
          this.hasNoExample = true;
          return of('');
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        this.exampleHtml = response;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
